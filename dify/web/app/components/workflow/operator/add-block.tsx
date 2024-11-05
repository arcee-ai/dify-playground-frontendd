import { memo, useCallback, useState } from 'react'
import { useStoreApi } from 'reactflow'
import { useTranslation } from 'react-i18next'
import type { OffsetOptions } from '@floating-ui/react'
import { generateNewNode } from '../utils'
import {
  useAvailableBlocks,
  useNodesReadOnly,
  usePanelInteractions,
} from '../hooks'
import { NODES_INITIAL_DATA } from '../constants'
import { useWorkflowStore } from '../store'
import Aicon from '../../base/a-icon'
import Button from '../../base/button'
import TipPopup from './tip-popup'
import BlockSelector from '@/app/components/workflow/block-selector'
import type { OnSelectBlock } from '@/app/components/workflow/types'
import { BlockEnum } from '@/app/components/workflow/types'

type AddBlockProps = {
  renderTrigger?: (open: boolean) => React.ReactNode
  offset?: OffsetOptions
}
const AddBlock = ({ renderTrigger, offset }: AddBlockProps) => {
  const { t } = useTranslation()
  const store = useStoreApi()
  const workflowStore = useWorkflowStore()
  const { nodesReadOnly } = useNodesReadOnly()
  const { handlePaneContextmenuCancel } = usePanelInteractions()
  const [open, setOpen] = useState(false)
  const { availableNextBlocks } = useAvailableBlocks(BlockEnum.Start, false)

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setOpen(open)
      if (!open)
        handlePaneContextmenuCancel()
    },
    [handlePaneContextmenuCancel],
  )

  const handleSelect = useCallback<OnSelectBlock>(
    (type, toolDefaultValue) => {
      const { getNodes } = store.getState()
      const nodes = getNodes()
      const nodesWithSameType = nodes.filter(node => node.data.type === type)
      const { newNode } = generateNewNode({
        data: {
          ...NODES_INITIAL_DATA[type],
          title:
            nodesWithSameType.length > 0
              ? `${t(`workflow.blocks.${type}`)} ${
                nodesWithSameType.length + 1
              }`
              : t(`workflow.blocks.${type}`),
          ...(toolDefaultValue || {}),
          _isCandidate: true,
        },
        position: {
          x: 0,
          y: 0,
        },
      })
      workflowStore.setState({
        candidateNode: newNode,
      })
    },
    [store, workflowStore, t],
  )

  const renderTriggerElement = useCallback(
    (open: boolean) => {
      return (
        <TipPopup title={t('workflow.common.addBlock')}>
          <Button
            variant={open ? 'ghost-accent' : 'ghost'}
            size="medium"
            className="btn-icon"
            disabled={nodesReadOnly}
          >
            <Aicon size={20} icon="icon-add-circle" className="a-icon--btn" />
          </Button>
        </TipPopup>
      )
    },
    [nodesReadOnly, t],
  )

  return (
    <BlockSelector
      open={open}
      onOpenChange={handleOpenChange}
      disabled={nodesReadOnly}
      onSelect={handleSelect}
      placement="top-start"
      offset={
        offset ?? {
          mainAxis: 4,
          crossAxis: -8,
        }
      }
      trigger={renderTrigger || renderTriggerElement}
      popupClassName="!min-w-[256px]"
      availableBlocksTypes={availableNextBlocks}
    />
  )
}

export default memo(AddBlock)
