'use client'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@/app/components/base/button'
import VariableModal from '@/app/components/workflow/panel/env-panel/variable-modal'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/app/components/base/portal-to-follow-elem'
import type { EnvironmentVariable } from '@/app/components/workflow/types'
import Aicon from '@/app/components/base/a-icon'

type Props = {
  open: boolean
  setOpen: (value: React.SetStateAction<boolean>) => void
  env?: EnvironmentVariable
  onClose: () => void
  onSave: (env: EnvironmentVariable) => void
}

const VariableTrigger = ({ open, setOpen, env, onClose, onSave }: Props) => {
  const { t } = useTranslation()

  return (
    <PortalToFollowElem
      open={open}
      onOpenChange={() => {
        setOpen(v => !v)
        open && onClose()
      }}
      placement="left-start"
      offset={{
        mainAxis: 8,
        alignmentAxis: -104,
      }}
    >
      <PortalToFollowElemTrigger
        onClick={() => {
          setOpen(v => !v)
          open && onClose()
        }}
      >
        <Button variant="secondary" size="medium" className="btn-icon-left">
          <Aicon icon="icon-add" size={20} className="a-icon--btn" />
          <span>{t('workflow.env.envPanelButton')}</span>
        </Button>
      </PortalToFollowElemTrigger>
      <PortalToFollowElemContent className="z-[11]">
        <VariableModal
          env={env}
          onSave={onSave}
          onClose={() => {
            onClose()
            setOpen(false)
          }}
        />
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  )
}

export default VariableTrigger
