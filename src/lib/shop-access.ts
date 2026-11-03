import type { Access, FieldAccess } from 'payload'

export const shopAdmin: Access = ({ req }) => req.user?.collection === 'admins'
export const shopAdminField: FieldAccess = ({ req }) => req.user?.collection === 'admins'
