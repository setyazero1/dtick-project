import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Determine role based on wallet address
    const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET;
    const organizerWallets = process.env.NEXT_PUBLIC_ORGANIZER_WALLETS?.split(',') || [];

    let role = 'user';
    if (walletAddress === adminWallet) {
      role = 'admin';
    } else if (organizerWallets.includes(walletAddress)) {
      role = 'organizer';
    }

    return NextResponse.json({
      walletAddress,
      role,
      authenticated: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}