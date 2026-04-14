import { IconGoogle, IconApple } from '../Icons';
import React from "react";

export const SocialDivider: React.FC = () => (
    <div className="mt-6">
        <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[var(--color-brand-muted)] text-xs shrink-0 tracking-wide uppercase">
      or continue with
    </span>
            <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
            <button type="button" className="social-btn" aria-label="Continue with Google">
                <IconGoogle />
                <span>Google</span>
            </button>
            <button type="button" className="social-btn" aria-label="Continue with Apple">
                <IconApple />
                <span>Apple</span>
            </button>
        </div>
    </div>
);