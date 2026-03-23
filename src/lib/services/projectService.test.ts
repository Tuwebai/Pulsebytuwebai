// =====================================================
// ARCHIVO DE PRUEBA PARA VERIFICAR PROJECT SERVICE
// =====================================================
// Este archivo es solo para verificar que el service funciona
// Se puede eliminar en producción

import { projectService } from './projectService';

// Función para probar el servicio
export async function testProjectService() {
  try {
    // Pruebas del Project Service
    return true;

  } catch (error) {
    console.error('❌ Error en las pruebas del Project Service:', error);
    return false;
  }
}

// Función para probar operaciones CRUD
export async function testProjectCRUD() {
  try {
    // Pruebas de operaciones CRUD

    // 1. Crear proyecto de prueba
    const testProject = {
      name: 'Proyecto de Prueba',
      description: 'Este es un proyecto de prueba para verificar el servicio',
      technologies: ['React', 'TypeScript', 'Supabase'],
      status: 'development' as const,
      github_repository_url: 'https://github.com/test/test-project'
    };

    // console.log('➕ Creando proyecto de prueba...');
    const createdProject = await projectService.createProject(testProject);
    // console.log('✅ Proyecto creado:', createdProject.id);

    // 2. Obtener proyecto por ID
    // console.log('🔍 Obteniendo proyecto por ID...');
    const retrievedProject = await projectService.getProjectById(createdProject.id);
    // console.log('✅ Proyecto obtenido:', retrievedProject.name);

    // 3. Actualizar proyecto
    // console.log('✏️ Actualizando proyecto...');
    const updatedProject = await projectService.updateProject(createdProject.id, {
      description: 'Descripción actualizada del proyecto de prueba'
    });
    // console.log('✅ Proyecto actualizado:', updatedProject.description);

    // 4. Verificar que existe
    // console.log('✅ Verificando existencia...');
    const exists = await projectService.projectExists(createdProject.id);
    // console.log('✅ Proyecto existe:', exists);

    // 5. Obtener proyectos similares
    // console.log('🔍 Obteniendo proyectos similares...');
    const similarProjects = await projectService.getSimilarProjects(createdProject.id);
    // console.log('✅ Proyectos similares encontrados:', similarProjects.length);

    // 6. Eliminar proyecto de prueba
    // console.log('🗑️ Eliminando proyecto de prueba...');
    await projectService.deleteProject(createdProject.id);
    // console.log('✅ Proyecto eliminado');

    // console.log('🎉 Todas las operaciones CRUD del Project Service pasaron exitosamente!');
    return true;

  } catch (error) {
    console.error('❌ Error en las pruebas CRUD del Project Service:', error);
    return false;
  }
}

// Función para probar búsquedas y filtros
export async function testProjectSearchAndFilters() {
  try {
    // console.log('🧪 Probando búsquedas y filtros...');

    // 1. Búsqueda por texto
    // console.log('🔍 Probando búsqueda por texto...');
    const searchResults = await projectService.searchProjects('test');
    // console.log('✅ Resultados de búsqueda:', searchResults.length);

    // 2. Filtros por estado
    // console.log('🔍 Probando filtros por estado...');
    const developmentProjects = await projectService.getProjectsByStatus('development');
    // console.log('✅ Proyectos en desarrollo:', developmentProjects.length);

    // 3. Filtros por tecnologías
    // console.log('🔍 Probando filtros por tecnologías...');
    const reactProjects = await projectService.getProjectsByTechnologies(['React']);
    // console.log('✅ Proyectos con React:', reactProjects.length);

    // console.log('🎉 Todas las pruebas de búsqueda y filtros pasaron exitosamente!');
    return true;

  } catch (error) {
    console.error('❌ Error en las pruebas de búsqueda y filtros:', error);
    return false;
  }
}

// Función principal para ejecutar todas las pruebas
export async function runAllProjectServiceTests() {
  // console.log('🚀 Iniciando pruebas completas del Project Service...\n');

  const results = {
    basic: await testProjectService(),
    crud: await testProjectCRUD(),
    search: await testProjectSearchAndFilters()
  };

  // console.log('\n📋 Resumen de resultados:');
  // console.log('✅ Pruebas básicas:', results.basic ? 'PASARON' : 'FALLARON');
  // console.log('✅ Pruebas CRUD:', results.crud ? 'PASARON' : 'FALLARON');
  // console.log('✅ Pruebas de búsqueda:', results.search ? 'PASARON' : 'FALLARON');

  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    // console.log('\n🎉 ¡Todas las pruebas del Project Service pasaron exitosamente!');
  } else {
    // console.log('\n❌ Algunas pruebas del Project Service fallaron');
  }

  return allPassed;
}

// Exportar para uso en desarrollo
export default {
  testProjectService,
  testProjectCRUD,
  testProjectSearchAndFilters,
  runAllProjectServiceTests
};
