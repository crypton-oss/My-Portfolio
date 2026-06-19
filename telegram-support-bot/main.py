#!/usr/bin/env python3
import os, json, threading, logging
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(os.path.dirname(__file__), "bot.log")),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger("bot")

BASE_DIR = os.path.dirname(__file__)

def load_env():
    env = {}
    try:
        with open(os.path.join(BASE_DIR, ".env")) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" not in line:
                    continue
                k, _, v = line.partition("=")
                env[k.strip()] = v.strip()
    except FileNotFoundError:
        pass
    return env

env = load_env()
PORT = int(os.environ.get("PORT") or env.get("PORT", "3001"))
BOT_TOKEN = os.environ.get("BOT_TOKEN") or env.get("BOT_TOKEN", "")
CHAT_ID = os.environ.get("CHAT_ID") or env.get("CHAT_ID", "")
SITE_URL = os.environ.get("SITE_URL") or env.get("SITE_URL", "https://full-steck.uz")
ADMIN_TG = os.environ.get("ADMIN_TG") or env.get("ADMIN_TG", "https://t.me/anonim_crypton")

TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}"
TIMEOUT = 30
USERS_FILE = os.path.join(BASE_DIR, "users.json")

# ── Users JSON storage ──────────────────────────────────────────
_users_lock = threading.Lock()

def load_users():
    _users_lock.acquire()
    try:
        if os.path.exists(USERS_FILE):
            with open(USERS_FILE, encoding="utf-8") as f:
                return json.load(f)
        return []
    finally:
        _users_lock.release()

def save_users(users):
    _users_lock.acquire()
    try:
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=2, ensure_ascii=False)
    finally:
        _users_lock.release()

def track_device(device_id, user_agent, is_new):
    users = load_users()
    existing = next((u for u in users if u["deviceId"] == device_id), None)
    now = datetime.now().isoformat()
    if existing:
        existing["lastSeen"] = now
        existing["visits"] = existing.get("visits", 1) + 1
        save_users(users)
        return {"new": False, "total": len(users)}
    users.append({
        "deviceId": device_id,
        "userAgent": user_agent,
        "firstSeen": now,
        "lastSeen": now,
        "visits": 1,
    })
    save_users(users)
    total = len(users)
    log.info("New device tracked (total: %d)", total)
    return {"new": True, "total": total}

# ── Telegram API ───────────────────────────────────────────────
def api_call(method, payload):
    data = json.dumps(payload).encode()
    req = Request(f"{TELEGRAM_API}/{method}", data=data,
                  headers={"Content-Type": "application/json"})
    try:
        with urlopen(req, timeout=TIMEOUT) as resp:
            return json.loads(resp.read())
    except HTTPError as e:
        body = e.read().decode()
        log.error("Telegram API error (%s): %s %s", method, e.code, body)
        return json.loads(body) if body else {"ok": False, "description": str(e)}
    except Exception as e:
        log.error("Telegram API error (%s): %s", method, e)
        return {"ok": False, "description": str(e)}

# ── HTTP Server ────────────────────────────────────────────────
class ContactHandler(BaseHTTPRequestHandler):
    def _send_json(self, status, body):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())

    def log_message(self, format, *args):
        pass

    def do_OPTIONS(self):
        self._send_json(204, "")

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            self._send_json(400, {"error": "Invalid JSON"})
            return

        path = self.path

        # ── Device tracking ──
        if path == "/api/track":
            device_id = data.get("deviceId", "")
            user_agent = data.get("userAgent", "")
            is_new = data.get("isNew", False)
            if not device_id:
                self._send_json(400, {"error": "deviceId required"})
                return
            result = track_device(device_id, user_agent, is_new)
            self._send_json(200, result)
            return

        # ── Contact form ──
        if path == "/api/contact":
            name = data.get("name", "").strip()
            email = data.get("email", "").strip()
            phone = data.get("phone", "").strip()
            message = data.get("message", "").strip()

            if not name or not email or not message:
                self._send_json(400, {"error": "name, email, and message are required"})
                return

            if not BOT_TOKEN or not CHAT_ID:
                self._send_json(500, {"error": "Bot not configured"})
                return

            now = datetime.now()
            date_str = now.strftime("%d-%B %Y")
            time_str = now.strftime("%H:%M")

            lines = [
                "<b>\U0001f4e9 Yangi xabar</b>",
                "\u2500" * 20,
                f"<b>Ism:</b> {name}",
                f"<b>Email:</b> {email}",
            ]
            if phone:
                lines.append(f"<b>Telefon:</b> {phone}")
            lines += [
                "",
                "<b>Xabar:</b>",
                message,
                "",
                f"<i>\U0001f550 {date_str} \u2014 {time_str}</i>",
            ]

            result = api_call("sendMessage", {
                "chat_id": CHAT_ID,
                "text": "\n".join(lines),
                "parse_mode": "HTML",
            })

            if result.get("ok"):
                log.info("Message forwarded from %s (%s)", name, email)
                self._send_json(200, {"success": True})
            else:
                desc = result.get("description", "Noma'lum xatolik")
                log.error("Telegram xatosi: %s", desc)
                self._send_json(500, {"error": f"Telegram xatosi: {desc}"})
            return

        self._send_json(404, {"error": "Not found"})

# ── Bot Polling ────────────────────────────────────────────────
def poll_bot():
    if not BOT_TOKEN:
        return
    offset = 0
    log.info("Polling started...")
    while True:
        result = api_call("getUpdates", {
            "offset": offset,
            "timeout": 25,
            "allowed_updates": ["message", "callback_query"],
        })
        if not result.get("ok"):
            desc = result.get("description", "")
            # Long-poll timeout is normal — just retry
            if "timed out" in desc.lower() or result.get("error_code") == 409:
                threading.Event().wait(1)
                continue
            log.warning("getUpdates failed: %s", desc)
            threading.Event().wait(3)
            continue

        for update in result.get("result", []):
            update_id = update["update_id"]
            offset = update_id + 1

            cb = update.get("callback_query")
                if cb:
                    cid = str(cb["from"]["id"])
                    cb_id = cb["id"]
                    data = cb.get("data", "")
                    username = cb["from"].get("first_name", "Foydalanuvchi")

                    api_call("answerCallbackQuery", {"callback_query_id": cb_id})

                    if cid == CHAT_ID:
                        if data == "bot_users":
                            total = len(load_users())
                            api_call("sendMessage", {
                                "chat_id": cid,
                                "text": (
                                    f"\U0001f465 <b>Bot foydalanuvchilari</b>\n\n"
                                    f"\U0001f539 Jami qurilmalar: <b>{total}</b>\n\n"
                                    f"\U0001f4c5 Saytga kirgan har bir yangi qurilma "
                                    f"avtomatik tarzda ro'yxatga olinadi."
                                ),
                                "parse_mode": "HTML",
                            })
                        elif data == "site_users":
                            api_call("sendMessage", {
                                "chat_id": cid,
                                "text": (
                                    "\U0001f465 <b>Sayt foydalanuvchilari</b>\n\n"
                                    "Hozircha bu funksiya ishlab chiqilmoqda \U0001f6a7"
                                ),
                                "parse_mode": "HTML",
                            })
                        elif data == "messages":
                            api_call("sendMessage", {
                                "chat_id": cid,
                                "text": (
                                    "\U0001f4ac <b>Xabarlar</b>\n\n"
                                    "Barcha kelgan xabarlar shu chatda ko'rinadi.\n\n"
                                    "Yangi xabar kelganda sizga bildirishnoma yuboriladi."
                                ),
                                "parse_mode": "HTML",
                            })
                        elif data == "add_admin":
                            api_call("sendMessage", {
                                "chat_id": cid,
                                "text": (
                                    "\U0001f451 <b>Admin tayinlash</b>\n\n"
                                    "Yangi admin qo'shish uchun uning Telegram ID sini yuboring.\n\n"
                                    "Misol: <code>123456789</code>"
                                ),
                                "parse_mode": "HTML",
                            })
                    else:
                        api_call("sendMessage", {
                            "chat_id": cid,
                            "text": "\U0000274c Bu tugmalar faqat admin uchun.",
                        })

                    log.info("Callback from %s: %s", username, data)
                    continue

                msg = update.get("message")
                if not msg:
                    continue

                # Skip bot's own outgoing messages
                sender = msg.get("from", {})
                if sender.get("is_bot"):
                    continue

                chat = msg.get("chat", {})
                cid = str(chat.get("id", ""))
                text = msg.get("text", "")
                entities = msg.get("entities", [])
                username = sender.get("first_name", "Foydalanuvchi")

                if not cid:
                    continue

                # ── Premium emoji ID detector (admin only) ──
                if cid == CHAT_ID and entities:
                    emoji_entities = [
                        e for e in entities
                        if e.get("type") == "custom_emoji" and e.get("custom_emoji_id")
                    ]
                    if emoji_entities:
                        lines = ["\U0001f9f0 <b>Premium emoji ID lar:</b>\n"]
                        for e in emoji_entities:
                            eid = e["custom_emoji_id"]
                            offset = e["offset"]
                            length = e["length"]
                            emoji_char = text[offset:offset + length]
                            lines.append(f"<code>{eid}</code> \u2014 {emoji_char}")
                        lines.append(
                            "\n\U0001f447 Bot kodida ishlatish:\n"
                            "<code>&lt;tg-emoji emoji-id=\"...\"&gt;\U0001f44d&lt;/tg-emoji&gt;</code>"
                        )
                        api_call("sendMessage", {
                            "chat_id": cid,
                            "text": "\n".join(lines),
                            "parse_mode": "HTML",
                        })
                        log.info("Sent emoji IDs to admin")
                        continue

                # ── /start command ──
                if text != "/start":
                    continue

                if cid == CHAT_ID:
                    reply_text = (
                        '<tg-emoji emoji-id="5210952530676505717">\U0001f44b</tg-emoji> '
                        "<b>Assalomu alaykum, Admin!</b>\n\n"
                        "\u2728 Bot muvaffaqiyatli ishga tushdi.\n"
                        "Veb saytdan yuborilgan xabarlar shu chatga keladi."
                    )
                    keyboard = {
                        "inline_keyboard": [
                            [
                                {"text": "\U0001f465 Bot foydalanuvchilar", "callback_data": "bot_users"},
                                {"text": "\U0001f464 Sayt foydalanuvchilari", "callback_data": "site_users"},
                            ],
                            [
                                {"text": "\U0001f4ac Xabarlar", "callback_data": "messages"},
                                {"text": "\U0001f451 Admin tayinlash", "callback_data": "add_admin"},
                            ],
                        ]
                    }
                else:
                    reply_text = (
                        f"\U0001f44b <b>Assalomu alaykum, {username}!</b>\n\n"
                        "\U0001f916 Bu <b>Ozodbek Usmonqulov</b> ning portfolio web-sayti "
                        "uchun yordamchi bot.\n\n"
                        "\u2728 Quyidagi tugmalar orqali veb saytni ochishingiz "
                        "yoki buyurtma berishingiz mumkin:"
                    )
                    keyboard = {
                        "inline_keyboard": [
                            [
                                {"text": "\U0001f310 Veb saytni ochish", "url": SITE_URL},
                            ],
                            [
                                {"text": "\U0001f4dd Buyurtma berish", "url": ADMIN_TG},
                            ],
                        ]
                    }

                api_call("sendMessage", {
                    "chat_id": cid,
                    "text": reply_text,
                    "parse_mode": "HTML",
                    "reply_markup": keyboard,
                })
                log.info("Replied to /start from %s (chat_id=%s)", username, cid)

        threading.Event().wait(1)

if __name__ == "__main__":
    log.info("=== Bot starting ===")
    log.info("BOT_TOKEN: %s", "Set (%s...)" % BOT_TOKEN[:10] if BOT_TOKEN else "MISSING")
    log.info("CHAT_ID:   %s", CHAT_ID or "MISSING")
    log.info("SITE_URL:  %s", SITE_URL)
    log.info("Users file: %s", USERS_FILE)

    if not BOT_TOKEN or not CHAT_ID:
        log.warning(".env faylini to'ldiring!")

    if BOT_TOKEN:
        t = threading.Thread(target=poll_bot, daemon=True)
        t.start()

    server = HTTPServer(("0.0.0.0", PORT), ContactHandler)
    log.info("Bot running on http://localhost:%s", PORT)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()
        log.info("Bot stopped.")
