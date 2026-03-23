// Domain Services - Re-exports for backward compatibility
export * from './adminAdvancedService';
export {
  type UserSkill,
  type Task as AutomationServiceTask,
  type Report,
  type EscalationRule as AutomationEscalationRule,
  automationService
} from './automationService';
export * from './automationTaskService';
export * from './chartDataService';
export * from './contextAnalysisService';
export * from './databaseMigrations';
export * from './emailService';
export * from './emailTemplates';
export * from './errorHandler';
export * from './fileService';
export * from './notificationAnalyticsService';
export {
  type NotificationChannel as DeliveryNotificationChannel,
  type ChannelDeliveryResult,
  type UserChannelSubscription,
  type PushSubscription,
  BaseNotificationChannel,
  EmailNotificationChannel,
  PushNotificationChannel,
  InAppNotificationChannel,
  WebhookNotificationChannel,
  NotificationChannelService,
  notificationChannelService
} from './notificationChannelService';
export * from './notificationRuleEngine';
export * from './notificationService';
export * from './notificationTemplateService';
export * from './notificationWorker';
export * from './paginationService';
export * from './paymentService';
export * from './projectManagementService';
export * from './projectService';
export * from './projectService.test';
export * from './pushNotificationService';
export * from './reportService';
export * from './scheduledNotificationService';
export {
  type TicketAssignment,
  type AgentWorkload,
  type AssignmentRule,
  type AssignmentCondition as TicketAssignmentCondition,
  type TicketData as TicketAssignmentData,
  ticketAssignmentService
} from './ticketAssignment';
export {
  type TicketEscalation,
  type EscalationAction,
  type EscalationRule,
  type EscalationCondition,
  type EscalationActionConfig,
  type TicketData as TicketEscalationData,
  ticketEscalationService
} from './ticketEscalation';
export * from './ticketService';
export {
  type TicketWorkflow,
  type WorkflowStage,
  type StageAction,
  type StageCondition,
  type AutoTransitionRule,
  type AutoAssignmentRule,
  type AssignmentCondition as WorkflowAssignmentCondition,
  type EscalationRule as WorkflowEscalationRule,
  type EscalationCondition as WorkflowEscalationCondition,
  type EscalationAction as WorkflowEscalationAction,
  type SLARule,
  type BusinessHours,
  type SLAException,
  DEFAULT_WORKFLOWS,
  ticketWorkflowService
} from './ticketWorkflow';
export * from './triggerService';
export * from './unifiedEmailTemplate';
export * from './userManagement';
export * from './userPreferencesService';
export * from './versionService';
export * from './webhookHandler';
export * from './workflowService';
