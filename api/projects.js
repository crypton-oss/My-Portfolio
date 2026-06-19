import { createClient } from '@supabase/supabase-js';

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

  const authHeader = req.headers.authorization || '';
  const apiKey = authHeader.replace('Bearer ', '');
  const adminApiKey = process.env.ADMIN_API_KEY;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    res.status(500).json({
      error: 'Supabase not configured on server. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel Dashboard.'
    });
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const isAdminOp = req.method === 'POST' || req.method === 'PATCH' || req.method === 'DELETE';

  if (isAdminOp && adminApiKey && apiKey !== adminApiKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    switch (req.method) {
      case 'GET': {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('createdAt', { ascending: false });

        if (error) {
          // Table might not exist yet — return empty array instead of crashing
          console.warn('Supabase GET error (returning []):', error.message);
          res.status(200).json([]);
          return;
        }
        res.status(200).json(data);
        break;
      }

      case 'POST': {
        const body = req.body;
        const project = {
          ...body,
          createdAt: body.createdAt || new Date().toISOString(),
        };
        const { data, error } = await supabase
          .from('projects')
          .insert(project)
          .select()
          .single();

        if (error) throw error;
        res.status(201).json(data);
        break;
      }

      case 'PATCH': {
        const { id, hidden } = req.body;
        if (!id) { res.status(400).json({ error: 'id required' }); return; }

        const { error } = await supabase
          .from('projects')
          .update({ hidden })
          .eq('id', id);

        if (error) throw error;
        res.status(200).json({ success: true });
        break;
      }

      case 'DELETE': {
        const { id } = req.body;
        if (!id) { res.status(400).json({ error: 'id required' }); return; }

        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', id);

        if (error) throw error;
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

export const config = {
  runtime: 'nodejs',
};
