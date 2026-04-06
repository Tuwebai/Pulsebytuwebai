// Supabase Edge Function para Proyectos
// Maneja operaciones CRUD sobre la tabla projects

// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// @ts-expect-error - Deno import for Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

// Helper para crear cliente de Supabase
function createSupabaseClient(): ReturnType<typeof createClient> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Helper para obtener el user_id del token JWT
function getUserIdFromAuth(req: globalThis.Request): string | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;
  
  // El token viene en formato "Bearer <token>"
  const token = authHeader.replace('Bearer ', '');
  
  // Decodificar el JWT manualmente (sin verificación para obtener el user_id)
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  // Manejar CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const supabase = createSupabaseClient();
  const userId = getUserIdFromAuth(req);
  
  // Extraer el ID del proyecto de la URL si existe
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const projectId = pathParts.length > 1 ? pathParts[pathParts.length - 1] : null;

  try {
    // GET /proyectos - Listar proyectos
    if (req.method === 'GET') {
      // Obtener parámetros de query
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const status = url.searchParams.get('status');
      const search = url.searchParams.get('search');
      const sortField = url.searchParams.get('sortField') || 'created_at';
      const sortDirection = url.searchParams.get('sortDirection') || 'desc';
      
      // Construir query base - usar select('*') para traer TODOS los campos de la tabla
      // incluyendo: fases, tareas, progress, completion_percentage, priority, start_date, end_date, type
      let query = supabase
        .from('projects')
        .select('*', { count: 'exact' });
      
      // Filtrar por usuario si no es admin (aquí asumimos que filtramos por created_by)
      if (userId) {
        query = query.eq('created_by', userId);
      }
      
      // Aplicar filtros adicionales
      if (status) {
        query = query.eq('status', status);
      }
      
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }
      
      // Ordenar
      query = query.order(sortField, { ascending: sortDirection === 'asc' });
      
      // Paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
      
      const { data: projects, error, count } = await query;
      
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({
        data: projects || [],
        total: count || 0,
        page,
        limit,
        hasMore: (count || 0) > to,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // POST /proyectos - Crear proyecto
    if (req.method === 'POST') {
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const body = await req.json();
      const { name, description, technologies, environment_variables, status: projectStatus, github_repository_url, customicon, priority, start_date, end_date } = body;
      
      if (!name) {
        return new Response(JSON.stringify({ error: 'El nombre del proyecto es requerido' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (!technologies || technologies.length === 0) {
        return new Response(JSON.stringify({ error: 'Al menos una tecnología es requerida' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          name,
          description,
          technologies,
          environment_variables: environment_variables || {},
          status: projectStatus || 'development',
          github_repository_url,
          customicon: customicon || 'FolderOpen',
          created_by: userId,
          priority: priority || 'medium',
          start_date,
          end_date,
          progress: 0,
          completion_percentage: 0,
        })
        .select()
        .single();
      
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify(project), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // PATCH /proyectos/:id - Actualizar proyecto
    if (req.method === 'PATCH') {
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (!projectId) {
        return new Response(JSON.stringify({ error: 'Project ID es requerido' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Verificar que el proyecto existe y pertenece al usuario
      const { data: existingProject, error: fetchError } = await supabase
        .from('projects')
        .select('created_by')
        .eq('id', projectId)
        .single();
      
      if (fetchError || !existingProject) {
        return new Response(JSON.stringify({ error: 'Proyecto no encontrado' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (existingProject.created_by !== userId) {
        return new Response(JSON.stringify({ error: 'No tienes permisos para actualizar este proyecto' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const body = await req.json();
      const { name, description, technologies, environment_variables, status: projectStatus, github_repository_url, customicon, is_active, priority, start_date, end_date, progress, completion_percentage } = body;
      
      const updateData: Record<string, unknown> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (technologies !== undefined) updateData.technologies = technologies;
      if (environment_variables !== undefined) updateData.environment_variables = environment_variables;
      if (projectStatus !== undefined) updateData.status = projectStatus;
      if (github_repository_url !== undefined) updateData.github_repository_url = github_repository_url;
      if (customicon !== undefined) updateData.customicon = customicon;
      if (is_active !== undefined) updateData.is_active = is_active;
      if (priority !== undefined) updateData.priority = priority;
      if (start_date !== undefined) updateData.start_date = start_date;
      if (end_date !== undefined) updateData.end_date = end_date;
      if (progress !== undefined) updateData.progress = progress;
      if (completion_percentage !== undefined) updateData.completion_percentage = completion_percentage;
      
      updateData.updated_at = new Date().toISOString();
      
      const { data: project, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId)
        .select()
        .single();
      
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify(project), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // DELETE /proyectos/:id - Eliminar proyecto
    if (req.method === 'DELETE') {
      if (!userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (!projectId) {
        return new Response(JSON.stringify({ error: 'Project ID es requerido' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Verificar que el proyecto existe y pertenece al usuario
      const { data: existingProject, error: fetchError } = await supabase
        .from('projects')
        .select('created_by')
        .eq('id', projectId)
        .single();
      
      if (fetchError || !existingProject) {
        return new Response(JSON.stringify({ error: 'Proyecto no encontrado' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (existingProject.created_by !== userId) {
        return new Response(JSON.stringify({ error: 'No tienes permisos para eliminar este proyecto' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
      
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }
    
    // Método no permitido
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error en Edge Function proyectos:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
