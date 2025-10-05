import { NextResponse } from 'next/server';

const categories = [
  'Phở',
  'Bún',
  'Cơm',
  'Bánh Mì',
  'Món Đặc Biệt',
  'Đồ Uống',
  'Tráng Miệng',
  'Món Chay'
];

export async function GET() {
  try {
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
