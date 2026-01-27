import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password minimal 8 karakter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password harus mengandung huruf besar')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password harus mengandung huruf kecil')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password harus mengandung angka')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password harus mengandung karakter khusus')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}