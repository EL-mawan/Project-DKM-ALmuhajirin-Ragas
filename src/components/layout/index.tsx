import { Header } from './header'
import { Footer } from './footer'
import { MobileNav } from './mobile-nav'

interface LayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  showFooter?: boolean
  className?: string
}

export function Layout({ 
  children, 
  showHeader = true, 
  showFooter = true,
  className = '' 
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header />}
      
      <main className={`flex-1 pb-32 sm:pb-0 ${className}`}>
        {children}
      </main>
      
      <MobileNav />
      {showFooter && <Footer />}
    </div>
  )
}