export type UserId = string & { readonly __brand: 'UserId' }
export type WorkspaceId = string & { readonly __brand: 'WorkspaceId' }
export type ProjectId = string & { readonly __brand: 'ProjectId' }
export type IssueId = string & { readonly __brand: 'IssueId' }
export type SprintId = string & { readonly __brand: 'SprintId' }
export type CommentId = string & { readonly __brand: 'CommentId' }
export type LabelId = string & { readonly __brand: 'LabelId' }
export type AttachmentId = string & { readonly __brand: 'AttachmentId' }

export const asUserId = (v: string) => v as UserId
export const asIssueId = (v: string) => v as IssueId
export const asProjectId = (v: string) => v as ProjectId
export const asWorkspaceId = (v: string) => v as WorkspaceId
export const asSprintId = (v: string) => v as SprintId
export const asCommentId = (v: string) => v as CommentId
export const asLabelId = (v: string) => v as LabelId
export const asAttachmentId = (v: string) => v as AttachmentId
