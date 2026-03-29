import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient({
    log: ['info', 'warn', 'error'],
});

export default prisma;
