import { createClient } from '@/lib/supabase/server'

export type Permission = {
  module: string
  action: string
}

export async function getUserPermissions(userId: string): Promise<Permission[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('user_roles')
    .select(`
      role:roles(
        role_permissions(
          permission:permissions(module, action)
        )
      )
    `)
    .eq('user_id', userId)

  if (!data) return []

  const perms: Permission[] = []
  data.forEach((ur: any) => {
    ur.role?.role_permissions?.forEach((rp: any) => {
      if (rp.permission) perms.push(rp.permission)
    })
  })

  return perms
}

export async function hasPermission(userId: string, module: string, action: string): Promise<boolean> {
  // Super admins have all permissions
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', userId)
    .single()

  if (profile?.user_type === 'super_admin') return true

  const perms = await getUserPermissions(userId)
  return perms.some(p => p.module === module && p.action === action)
}

export async function logActivity({
  userId, email, action, entityType, entityId, oldValues, newValues, ip, userAgent
}: {
  userId: string; email: string; action: string; entityType: string;
  entityId?: string; oldValues?: any; newValues?: any; ip?: string; userAgent?: string;
}) {
  const supabase = await createClient()
  await supabase.from('admin_activity_logs').insert({
    actor_user_id: userId,
    actor_email: email,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_values: oldValues,
    new_values: newValues,
    request_ip: ip,
    user_agent: userAgent,
  })
}
