'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import BusinessProfileEditor from '@/components/BusinessProfileEditor';
import TeamManager from '@/components/TeamManager';
import type { AuthUser } from '@/lib/auth';

interface Props {
  open: boolean;
  onClose: () => void;
  user: AuthUser;
  onUpdate: () => void;
}

export default function BusinessSettingsDrawer({ open, onClose, user, onUpdate }: Props) {
  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[540px] p-0 flex flex-col bg-[var(--c-bg)] border-[var(--c-border)]"
      >
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-[var(--c-border)] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[8px] bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <i className="fa-solid fa-building text-purple-400 text-[11px]"></i>
            </div>
            <SheetTitle className="text-[14px] font-black text-[var(--c-text)] tracking-tight">
              Poslovne postavke
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <BusinessProfileEditor
            user={user}
            onUpdate={onUpdate}
            onSaveSuccess={onClose}
          />
          <TeamManager userId={user.id} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
