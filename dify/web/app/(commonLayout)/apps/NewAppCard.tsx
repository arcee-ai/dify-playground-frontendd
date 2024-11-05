'use client'

import { forwardRef, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import CreateAppTemplateDialog from '@/app/components/app/create-app-dialog'
import CreateAppModal from '@/app/components/app/create-app-modal'
import {
  CreateFromDSLModalTab,
} from '@/app/components/app/create-from-dsl-modal'
import { useProviderContext } from '@/context/provider-context'

import Button from '@/app/components/base/button'
import Aicon from '@/app/components/base/a-icon'

export type CreateAppCardProps = {
  onSuccess?: () => void
}

// eslint-disable-next-line react/display-name
const CreateAppCard = forwardRef<HTMLAnchorElement, CreateAppCardProps>(
  ({ onSuccess }, ref) => {
    const { t } = useTranslation()
    const { onPlanInfoChanged } = useProviderContext()
    const searchParams = useSearchParams()
    const { replace } = useRouter()
    const dslUrl = searchParams.get('remoteInstallUrl') || undefined

    const [showNewAppTemplateDialog, setShowNewAppTemplateDialog]
      = useState(false)
    const [showNewAppModal, setShowNewAppModal] = useState(false)
    const [showCreateFromDSLModal, setShowCreateFromDSLModal] = useState(
      !!dslUrl,
    )

    const activeTab = useMemo(() => {
      if (dslUrl)
        return CreateFromDSLModalTab.FROM_URL

      return undefined
    }, [dslUrl])

    return (
      <a
        ref={ref}
        className="relative col-span-1 flex flex-col justify-between min-h-[160px] bg-gray-50 rounded-2xl border border-gray-300"
      >
        <div className="flex items-center gap-4 p-3 rounded-t-xl">
          <div className="w-12 h-12 flex justify-center items-center rounded-full bg-white border border-gray-300 border-dashed">
            <Aicon
              size={24}
              color="var(--color-basic-gray-500"
              icon="icon-add"
            />
          </div>
          <div className="text-[18px] font-semi-bold leading-6 text-black">
            Add New
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2">
          <Button
            size={'medium'}
            variant="ghost"
            onClick={() => setShowNewAppModal(true)}
            className="btn-icon-left btn-rounded"
          >
            <Aicon size={20} className="a-icon--btn" icon="icon-copy-line" />
            <span>{t('app.newApp.startFromBlank')}</span>
          </Button>
          <Button
            size={'medium'}
            variant="ghost"
            onClick={() => setShowNewAppTemplateDialog(true)}
            className="btn-icon-left btn-rounded"
          >
            <Aicon size={20} className="a-icon--btn" icon="icon-copy-fill" />
            <span>{t('app.newApp.startFromTemplate')}</span>
          </Button>
        </div>
        <CreateAppModal
          show={showNewAppModal}
          onClose={() => setShowNewAppModal(false)}
          onSuccess={() => {
            onPlanInfoChanged()
            if (onSuccess)
              onSuccess()
          }}
        />
        <CreateAppTemplateDialog
          show={showNewAppTemplateDialog}
          onClose={() => setShowNewAppTemplateDialog(false)}
          onSuccess={() => {
            onPlanInfoChanged()
            if (onSuccess)
              onSuccess()
          }}
        />
      </a>
    )
  },
)

export default CreateAppCard
