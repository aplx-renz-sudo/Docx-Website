import React, { useState } from 'react';
import { Github, Instagram, ExternalLink, Copy, Check, X, Sparkles, User, MessageSquare } from 'lucide-react';

interface ConnectDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectDeveloperModal({ isOpen, onClose }: ConnectDeveloperModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2200);
  };

  const developerLinks = [
    {
      id: 'github',
      name: 'GitHub',
      handle: 'aplx-renz-sudo',
      url: 'https://github.com/aplx-renz-sudo',
      description: 'Repositories, open-source projects & code releases',
      iconType: 'github',
      badge: 'Source Code',
      badgeColor: 'rgba(255, 255, 255, 0.1)',
      textColor: '#ffffff',
    },
    {
      id: 'discord',
      name: 'Discord',
      handle: 'r3nz0r_1hah',
      url: 'https://discord.com/users/r3nz0r_1hah',
      copyValue: 'r3nz0r_1hah',
      description: 'Send a friend request or direct message on Discord',
      iconType: 'discord',
      badge: 'Direct Chat',
      badgeColor: 'rgba(88, 101, 242, 0.2)',
      textColor: '#5865F2',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@r3nz0r',
      url: 'https://www.instagram.com/r3nz0r/',
      description: 'Follow and connect directly via Instagram DM',
      iconType: 'instagram',
      badge: 'Social',
      badgeColor: 'rgba(225, 48, 108, 0.2)',
      textColor: '#E1306C',
    },
  ];

  return (
    <div
      className="modal-overlay"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-developer-modal-title"
    >
      <div className="modal-dialog" style={{ maxWidth: '520px', width: '92%' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                color: '#a5b4fc',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                letterSpacing: '0.04em',
              }}
            >
              <Sparkles size={13} /> CONNECT WITH THE DEVELOPER
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Developer Bio Card */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.05))',
              border: '1px solid rgba(165, 180, 252, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                flexShrink: 0,
              }}
            >
              ⚡
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3
                  id="connect-developer-modal-title"
                  style={{ fontSize: '15px', fontWeight: 700, color: '#f5f5f7', margin: 0 }}
                >
                  R3nz
                </h3>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    background: 'rgba(165, 180, 252, 0.15)',
                    color: '#c7d2fe',
                    border: '1px solid rgba(165, 180, 252, 0.3)',
                    fontWeight: 600,
                  }}
                >
                  Lead Developer
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: '3px 0 0', lineHeight: 1.4 }}>
                Creator & maintainer of VileDocx AI. Connect for collaborations, feedback, questions, or feature suggestions!
              </p>
            </div>
          </div>

          {/* Social Links List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {developerLinks.map(link => (
              <div
                key={link.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {link.iconType === 'github' && <Github size={19} className="text-white" />}
                    {link.iconType === 'instagram' && <Instagram size={19} style={{ color: '#E1306C' }} />}
                    {link.iconType === 'discord' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#5865F2">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#f5f5f7' }}>
                        {link.name}
                      </span>
                      <span
                        style={{
                          fontSize: '9px',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: link.badgeColor,
                          color: link.textColor,
                          fontWeight: 600,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {link.badge}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontFamily: 'var(--font-mono)',
                        color: '#93c5fd',
                        marginTop: '2px',
                        fontWeight: 500,
                      }}
                    >
                      {link.handle}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#86868b',
                        marginTop: '2px',
                      }}
                    >
                      {link.description}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {link.copyValue && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(link.copyValue!, link.id)}
                      title="Copy Discord username"
                      style={{
                        padding: '7px 11px',
                        borderRadius: '8px',
                        background: copiedField === link.id ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                        border: copiedField === link.id ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(255, 255, 255, 0.12)',
                        color: copiedField === link.id ? '#4ade80' : '#e2e8f0',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {copiedField === link.id ? (
                        <>
                          <Check size={12} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy ID</span>
                        </>
                      )}
                    </button>
                  )}

                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                    }}
                  >
                    <span>Open</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Discord Notice note */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(88, 101, 242, 0.08)',
              border: '1px solid rgba(88, 101, 242, 0.25)',
              fontSize: '11px',
              color: '#c7d2fe',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <MessageSquare size={14} className="text-[#818cf8] shrink-0" />
            <span>
              On Discord, add <strong>r3nz0r_1hah</strong> directly in your friend requests or search.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            type="button"
            onClick={onClose}
            className="secondary-btn"
            style={{ fontSize: '12px', padding: '8px 16px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
