require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { sendOrderConfirmation } = require('./services/email.service');

const prisma = new PrismaClient();

async function simulateWebhook() {
  const paymentIntentId = 'pi_3StYQYEOiSg0hBbQ1DG2VP8y';
  const email = 'brunoferrazsabino@gmail.com';
  
  try {
    console.log('🔍 Verificando se pedido existe...');
    
    let order = await prisma.order.findFirst({
      where: { paymentIntentId },
    });
    
    if (order) {
      console.log('✅ Pedido já existe:', order.id);
    } else {
      console.log('📝 Criando pedido...');
      order = await prisma.order.create({
        data: {
          email,
          packageId: '1-photo',
          amount: 599,
          paymentIntentId,
          status: 'processing',
          photoCount: 1,
          originalFiles: [],
          restoredFiles: [],
        },
      });
      console.log('✅ Pedido criado:', order.id);
    }
    
    console.log('\n📧 Enviando email de confirmação...');
    await sendOrderConfirmation(
      email,
      order.id,
      order.packageId,
      order.photoCount,
      order.amount
    );
    
    console.log('✅ Email enviado com sucesso!');
    console.log('\n📬 Verifique sua caixa de entrada:', email);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

simulateWebhook();
