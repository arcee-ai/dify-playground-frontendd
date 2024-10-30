import { memo, useCallback, useState } from 'react'
import type { OffsetOptions } from '@floating-ui/react'
import PanelOperatorPopup from './panel-operator-popup'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/app/components/base/portal-to-follow-elem'
import type { Node } from '@/app/components/workflow/types'
import Button from '@/app/components/base/button'
import Aicon from '@/app/components/base/a-icon'

type PanelOperatorProps = {
  id: string
  data: Node['data']
  triggerClassName?: string
  offset?: OffsetOptions
  onOpenChange?: (open: boolean) => void
  inNode?: boolean
  showHelpLink?: boolean
}
const PanelOperator = ({
  id,
  data,
  triggerClassName,
  offset = {
    mainAxis: 4,
    crossAxis: 53,
  },
  onOpenChange,
  inNode,
  showHelpLink = true,
}: PanelOperatorProps) => {
  const [open, setOpen] = useState(false)

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen)

      if (onOpenChange)
        onOpenChange(newOpen)
    },
    [onOpenChange],
  )

  return (
    <PortalToFollowElem
      placement="bottom-end"
      offset={offset}
      open={open}
      onOpenChange={handleOpenChange}
    >
      <PortalToFollowElemTrigger onClick={() => handleOpenChange(!open)}>
        <Button
          size="medium"
          variant={open ? 'ghost-accent' : 'ghost'}
          className={`btn-icon ${triggerClassName}`}
        >
          <Aicon size={20} icon="icon-more" className="a-icon--btn" />
        </Button>
      </PortalToFollowElemTrigger>
      <PortalToFollowElemContent className="z-[11]">
        <PanelOperatorPopup
          id={id}
          data={data}
          onClosePopup={() => setOpen(false)}
          showHelpLink={showHelpLink}
        />
      </PortalToFollowElemContent>
    </PortalToFollowElem>
  )
}

export default memo(PanelOperator)
