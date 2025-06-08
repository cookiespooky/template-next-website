
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { isValidEmail } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { name, email, phone, subject, message, formType = 'general' } = await request.json();

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Некорректный email адрес' },
        { status: 400 }
      );
    }

    // Create contact form submission
    const contactForm = await prisma.contactForm.create({
      data: {
        userId: session?.user?.id || undefined,
        name,
        email,
        phone: phone || undefined,
        subject,
        message,
        formType,
        status: 'NEW'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Ваше сообщение успешно отправлено. Мы свяжемся с вами в ближайшее время.',
      contactForm: {
        id: contactForm.id,
        createdAt: contactForm.createdAt
      }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Не удалось отправить сообщение. Попробуйте позже.' },
      { status: 500 }
    );
  }
}
