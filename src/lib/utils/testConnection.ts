// =====================================================
// TEST DE CONEXIÃ“N REAL CON SUPABASE
// =====================================================
// Este archivo es solo para verificar la conexiÃ³n
// Se puede eliminar en producciÃ³n

import { supabase } from '../supabase';
import { projectService } from '../projectService';

export async function testSupabaseConnection() {
  try {

    
    // 1. Verificar que las variables de entorno estÃ¡n configuradas
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    


    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variables de entorno de Supabase no configuradas');
    }

    // 2. Probar conexiÃ³n bÃ¡sica
    // console.log('ðŸ” Probando conexiÃ³n bÃ¡sica...');
    const { data: testData, error: testError } = await supabase
      .from('projects')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('âŒ Error de conexiÃ³n:', testError);
      throw testError;
    }
    
    // console.log('âœ… ConexiÃ³n bÃ¡sica exitosa');

    // 3. Probar obtener proyectos
    // console.log('ðŸ“ Probando obtenciÃ³n de proyectos...');
    const projects = await projectService.getProjects();
    // console.log('âœ… Proyectos obtenidos:', projects.projects.length);
    // console.log('ðŸ“Š Total de proyectos:', projects.total);

    // 4. Probar estadÃ­sticas
    // console.log('ðŸ“Š Probando estadÃ­sticas...');
    const stats = await projectService.getProjectStats();
    // console.log('âœ… EstadÃ­sticas obtenidas:', stats);

    // 5. Probar tecnologÃ­as
    // console.log('ðŸ”§ Probando tecnologÃ­as...');
    const technologies = await projectService.getUniqueTechnologies();
    // console.log('âœ… TecnologÃ­as obtenidas:', technologies.length);

    // console.log('ðŸŽ‰ Â¡Todas las pruebas de conexiÃ³n pasaron exitosamente!');
    // console.log('ðŸ“‹ Resumen:');
    // console.log('- ConexiÃ³n a Supabase: âœ… FUNCIONANDO');
    // console.log('- Tabla projects: âœ… ACCESIBLE');
    // console.log('- Project Service: âœ… FUNCIONANDO');
    // console.log('- Datos reales: âœ… OBTENIDOS');
    
    return {
      success: true,
      projectsCount: projects.total,
      stats,
      technologiesCount: technologies.length
    };

  } catch (error) {
    console.error('âŒ Error en las pruebas de conexiÃ³n:', error);
    
    if (error.message.includes('variables de entorno')) {
      console.error('ðŸ’¡ SoluciÃ³n: Verifica que tienes un archivo .env con:');
      console.error('   VITE_SUPABASE_URL=tu_url_de_supabase');
      console.error('   VITE_SUPABASE_ANON_KEY=tu_clave_anonima');
    } else if (error.message.includes('projects')) {
      console.error('ðŸ’¡ SoluciÃ³n: Verifica que la tabla "projects" existe en tu base de datos');
    } else if (error.message.includes('permission')) {
      console.error('ðŸ’¡ SoluciÃ³n: Verifica los permisos RLS (Row Level Security) en Supabase');
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// FunciÃ³n para verificar el estado de la base de datos
export async function checkDatabaseStatus() {
  try {
    // console.log('ðŸ” Verificando estado de la base de datos...');
    
    // Verificar si la tabla projects existe
    const { data: tableInfo, error: tableError } = await supabase
      .from('projects')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('âŒ Error accediendo a la tabla projects:', tableError);
      return {
        tableExists: false,
        error: tableError.message
      };
    }
    
    // Verificar estructura de la tabla
    const { data: sampleData, error: sampleError } = await supabase
      .from('projects')
      .select('id, name, description, technologies, status, created_at, updated_at')
      .limit(1);
    
    if (sampleError) {
      console.error('âŒ Error verificando estructura de la tabla:', sampleError);
      return {
        tableExists: true,
        structureValid: false,
        error: sampleError.message
      };
    }
    
    // console.log('âœ… Tabla projects existe y es accesible');
    // console.log('âœ… Estructura de la tabla es vÃ¡lida');
    
    return {
      tableExists: true,
      structureValid: true,
      sampleData: sampleData
    };
    
  } catch (error) {
    console.error('âŒ Error verificando estado de la base de datos:', error);
    return {
      tableExists: false,
      error: error.message
    };
  }
}

// FunciÃ³n principal para ejecutar todas las verificaciones
export async function runFullDatabaseCheck() {
  // console.log('ðŸš€ Iniciando verificaciÃ³n completa de la base de datos...\n');
  
  const dbStatus = await checkDatabaseStatus();
  const connectionTest = await testSupabaseConnection();
  
  // console.log('\nðŸ“‹ Resumen completo:');
  // console.log('ðŸ”Œ Base de datos:', dbStatus.tableExists ? 'âœ… ACCESIBLE' : 'âŒ NO ACCESIBLE');
  // console.log('ðŸ“Š Estructura:', dbStatus.structureValid ? 'âœ… VÃLIDA' : 'âŒ INVÃLIDA');
  // console.log('ðŸ”— ConexiÃ³n:', connectionTest.success ? 'âœ… FUNCIONANDO' : 'âŒ FALLANDO');
  
  if (dbStatus.tableExists && dbStatus.structureValid && connectionTest.success) {
    // console.log('\nðŸŽ‰ Â¡La base de datos estÃ¡ completamente funcional!');
    // console.log('ðŸ“ˆ Proyectos en la base de datos:', connectionTest.projectsCount);
    // console.log('ðŸ”§ TecnologÃ­as disponibles:', connectionTest.technologiesCount);
  } else {
    // console.log('\nâš ï¸ Hay problemas con la base de datos que necesitan atenciÃ³n');
  }
  
  return {
    databaseStatus: dbStatus,
    connectionStatus: connectionTest
  };
}

export default {
  testSupabaseConnection,
  checkDatabaseStatus,
  runFullDatabaseCheck
};


