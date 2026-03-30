import prisma from './src/config/db.js';
import bcrypt from 'bcrypt';

async function createAdmin() {
    const email = 'admin@nutria.com';
    const password = 'admin';
    const name = 'Admin Nutria';

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        
        if (existingUser) {
            console.log('El usuario administrador ya existe.');
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        });

        console.log(`✅ Administrador creado exitosamente!`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error('Error creando administrador:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
