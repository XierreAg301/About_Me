import { useContext } from 'react';
import { PortfolioNavigationContext } from './portfolioNavigationState';

export default function usePortfolioNavigation() {
  const value = useContext(PortfolioNavigationContext);
  if (!value) {
    throw new Error('usePortfolioNavigation must be used inside PortfolioNavigationProvider');
  }
  return value;
}
