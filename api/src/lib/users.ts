/**
 * Cambia la contraseña de un usuario validando la actual
 */
import bcrypt from 'bcryptjs';
export async function changeUserPassword(id: string, currentPassword: string, newPassword: string): Promise<'ok' | 'invalid' | 'notfound'> {
  const { resource: user } = await container.item(id, id).read<User>();
  if (!user) return 'notfound';
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return 'invalid';
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await container.items.upsert(user);
  return 'ok';
}


// Importa el contenedor de Cosmos DB y el modelo de usuario
import { getContainer } from './cosmos';
import { User } from '../types/user';
import { v4 as uuidv4 } from 'uuid';

// Obtiene el contenedor 'users' de la base de datos
const container = getContainer('users');

/**
 * Busca un usuario por su id (partitionKey = id)
 */
export async function getUserById(id: string): Promise<User | null> {
  const { resource } = await container.item(id, id).read<User>();
  return resource ? (resource as unknown as User) : null;
}

/**
 * Devuelve todos los usuarios de la colección
 */
export async function getAllUsers(): Promise<User[]> {
  const query = { query: 'SELECT * FROM c' };
  const { resources } = await container.items.query<User>(query).fetchAll();
  return resources as User[];
}

/**
 * Crea un nuevo usuario en la base de datos
 * Recibe los datos del usuario y la contraseña en texto plano
 */
export async function createUser(user: Omit<User, 'id' | 'passwordHash'> & { password: string }): Promise<User | null> {
  const passwordHash = await bcrypt.hash(user.password, 10); // Hashea la contraseña
  const newUser: User = {
    ...user,
    id: uuidv4(), // Genera un id único
    passwordHash,
  };
  const { resource } = await container.items.create(newUser);
  return resource ? (resource as unknown as User) : null;
}

/**
 * Actualiza los datos de un usuario existente
 * Recibe el id y un objeto con los campos a actualizar
 */
export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const { resource: user } = await container.item(id, id).read<User>();
  if (!user) return null;
  Object.assign(user, updates); // Aplica los cambios
  const { resource } = await container.items.upsert(user);
  return resource ? (resource as unknown as User) : null;
}

/**
 * Elimina un usuario por su id
 */
export async function deleteUser(id: string): Promise<boolean> {
  await container.item(id, id).delete();
  return true;
}

// Busca un usuario por email en la base de datos
export async function findUserByEmail(email: string): Promise<User | null> {
  const querySpec = {
    query: 'SELECT * FROM c WHERE c.email = @email',
    parameters: [{ name: '@email', value: email }],
  };
  const { resources } = await container.items.query<User>(querySpec).fetchAll();
  return resources[0] || null;
}

// Valida la contraseña ingresada contra el hash almacenado
export async function validatePassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}
