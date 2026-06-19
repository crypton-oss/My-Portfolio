import { connectToDatabase } from './lib/mongodb.js';

const COLLECTION = 'projects';

export default async function handler(req, res) {
  const origin = req.headers.origin || 'http://localhost:5173';

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const isAdminOp = req.method === 'POST' || req.method === 'PATCH' || req.method === 'DELETE';
  const authHeader = req.headers.authorization || '';
  const apiKey = authHeader.replace('Bearer ', '');
  const adminApiKey = process.env.ADMIN_API_KEY;

  if (isAdminOp && adminApiKey && apiKey !== adminApiKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION);

    switch (req.method) {
      case 'GET': {
        const projects = await collection
          .find({})
          .sort({ createdAt: -1 })
          .toArray();
        // Convert ObjectId to string
        const data = projects.map((p) => ({ ...p, _id: p._id.toString() }));
        res.status(200).json(data);
        break;
      }

      case 'POST': {
        const body = req.body;
        const project = {
          ...body,
          createdAt: body.createdAt || new Date().toISOString(),
        };
        await collection.insertOne(project);
        res.status(201).json(project);
        break;
      }

      case 'PATCH': {
        const { id, hidden } = req.body;
        if (!id) {
          res.status(400).json({ error: 'id required' });
          return;
        }
        await collection.updateOne({ id }, { $set: { hidden } });
        res.status(200).json({ success: true });
        break;
      }

      case 'DELETE': {
        const { id } = req.body;
        if (!id) {
          res.status(400).json({ error: 'id required' });
          return;
        }
        await collection.deleteOne({ id });
        res.status(200).json({ success: true });
        break;
      }

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
