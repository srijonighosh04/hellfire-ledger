import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import WalletConnect from './WalletConnect';

export default function NavBar() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const links = [
        { href: '/', label: '[ HOME ]' },
        { href: '/upload', label: '[ UPLOAD ]' },
        { href: '/dashboard', label: '[ DASHBOARD ]' },
        { href: '/contract', label: '[ CONTRACT ]' },
    ];

    return (
        <nav className="nav-bar" style={{ boxShadow: scrolled ? '0 2px 20px rgba(57,255,20,0.15)' : 'none' }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none' }}>
                <span style={{ fontFamily: 'var(--font-terminal)', fontSize: '1.5rem', color: 'var(--color-neon-red)' }} className="text-glow-red">
                    🔥 HFG
                </span>
            </Link>

            {/* Nav links */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {links.map(link => {
                    const isActive = router.pathname === link.href;
                    return (
                        <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                            <span style={{
                                fontFamily: 'var(--font-terminal)',
                                fontSize: '1.05rem',
                                color: isActive ? 'var(--color-neon-green)' : 'rgba(57,255,20,0.5)',
                                letterSpacing: '0.05em',
                                transition: 'color 0.2s, text-shadow 0.2s',
                                textShadow: isActive ? '0 0 10px var(--color-neon-green)' : 'none',
                            }}>
                                {link.label}
                            </span>
                        </Link>
                    );
                })}
                <WalletConnect compact />
            </div>
        </nav>
    );
}
