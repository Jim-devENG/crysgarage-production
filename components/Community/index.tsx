import React from 'react';
import { WhatsAppCommunity } from './WhatsAppCommunity';

interface CommunityPageProps {
  currentUser?: any;
}

export function CommunityPage({ currentUser }: CommunityPageProps) {
  return <WhatsAppCommunity />;
}
