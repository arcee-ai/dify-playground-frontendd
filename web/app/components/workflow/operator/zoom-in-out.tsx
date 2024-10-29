import type { FC } from 'react'
import { Fragment, memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useReactFlow, useViewport } from 'reactflow'
import { useNodesSyncDraft, useWorkflowReadOnly } from '../hooks'
import { getKeyboardKeyNameBySystem } from '../utils'
import ShortcutsName from '../shortcuts-name'
import Button from '../../base/button'
import Aicon from '../../base/a-icon'
import TipPopup from './tip-popup'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/app/components/base/portal-to-follow-elem'

enum ZoomType {
  zoomIn = 'zoomIn',
  zoomOut = 'zoomOut',
  zoomToFit = 'zoomToFit',
  zoomTo25 = 'zoomTo25',
  zoomTo50 = 'zoomTo50',
  zoomTo75 = 'zoomTo75',
  zoomTo100 = 'zoomTo100',
  zoomTo200 = 'zoomTo200',
}

const ZoomInOut: FC = () => {
  const { t } = useTranslation()
  const { zoomIn, zoomOut, zoomTo, fitView } = useReactFlow()
  const { zoom } = useViewport()
  const { handleSyncWorkflowDraft } = useNodesSyncDraft()
  const [open, setOpen] = useState(false)
  const { workflowReadOnly, getWorkflowReadOnly } = useWorkflowReadOnly()

  const ZOOM_IN_OUT_OPTIONS = [
    [
      {
        key: ZoomType.zoomTo200,
        text: '200%',
      },
      {
        key: ZoomType.zoomTo100,
        text: '100%',
      },
      {
        key: ZoomType.zoomTo75,
        text: '75%',
      },
      {
        key: ZoomType.zoomTo50,
        text: '50%',
      },
      {
        key: ZoomType.zoomTo25,
        text: '25%',
      },
    ],
    [
      {
        key: ZoomType.zoomToFit,
        text: t('workflow.operator.zoomToFit'),
      },
    ],
  ]

  const handleZoom = (type: string) => {
    if (workflowReadOnly)
      return

    if (type === ZoomType.zoomToFit)
      fitView()

    if (type === ZoomType.zoomTo25)
      zoomTo(0.25)

    if (type === ZoomType.zoomTo50)
      zoomTo(0.5)

    if (type === ZoomType.zoomTo75)
      zoomTo(0.75)

    if (type === ZoomType.zoomTo100)
      zoomTo(1)

    if (type === ZoomType.zoomTo200)
      zoomTo(2)

    handleSyncWorkflowDraft()
  }

  const handleTrigger = useCallback(() => {
    if (getWorkflowReadOnly())
      return

    setOpen(v => !v)
  }, [getWorkflowReadOnly])

  return (
    <PortalToFollowElem
      placement="top-start"
      open={open}
      onOpenChange={setOpen}
      offset={{
        mainAxis: 4,
        crossAxis: -2,
      }}
    >
      <PortalToFollowElemTrigger asChild onClick={handleTrigger}>
        <div
          className={`
          p-1  flex items-center gap-2 cursor-pointer text-sm text-gray-500 font-medium rounded-full bg-white shadow-lg 
          ${workflowReadOnly && '!cursor-not-allowed opacity-50'}
        `}
        >
          <TipPopup
            title={t('workflow.operator.zoomOut')}
            shortcuts={['ctrl', '-']}
          >
            <Button
              variant="ghost"
              size="medium"
              className="btn-icon"
              onClick={(e) => {
                e.stopPropagation()
                zoomOut()
              }}
            >
              <Aicon size={20} icon="icon-zoom-out" className="a-icon--btn" />
            </Button>
          </TipPopup>
          <div className="w-[34px]">
            {parseFloat(`${zoom * 100}`).toFixed(0)}%
          </div>
          <TipPopup
            title={t('workflow.operator.zoomIn')}
            shortcuts={['ctrl', '+']}
          >
            <Button
              variant="ghost"
              size="medium"
              className="btn-icon"
              onClick={(e) => {
                e.stopPropagation()
                zoomIn()
              }}
            >
              <Aicon size={20} icon="icon-zoom-in" className="a-icon--btn" />
            </Button>
          </TipPopup>
        </div>
      </PortalToFollowElemTrigger>
      <PortalToFollowElemContent className="z-10">
        <div className="w-[145px] rounded-lg border-[0.5px] border-gray-200 bg-white shadow-lg">
          {ZOOM_IN_OUT_OPTIONS.map((options, i) => (
            <Fragment key={i}>
              {i !== 0 && <div className="h-[1px] bg-gray-100" />}
              <div className="p-1">
                {options.map(option => (
                  <div
                    key={option.key}
                    className="flex items-center justify-between px-3 h-8 rounded-lg hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                    onClick={() => handleZoom(option.key)}
                  >
                    {option.text}
                    {option.key === ZoomType.zoomToFit && (
                      <ShortcutsName
                        keys={[`${getKeyboardKeyNameBySystem('ctrl')}`, '1']}
                      />
                    )}
                    {option.key === ZoomType.zoomTo50 && (
                      <ShortcutsName keys={['shift', '5']} />
                    )}
                    {option.key === ZoomType.zoomTo100 && (
                      <ShortcutsName keys={['shift', '1']} />
                    )}
                  </div>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  )
}

export default memo(ZoomInOut)
