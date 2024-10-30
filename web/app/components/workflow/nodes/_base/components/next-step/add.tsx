import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAvailableBlocks,
  useNodesInteractions,
  useNodesReadOnly,
  useWorkflow,
} from '@/app/components/workflow/hooks'
import BlockSelector from '@/app/components/workflow/block-selector'
import type {
  CommonNodeType,
  OnSelectBlock,
} from '@/app/components/workflow/types'
import Button from '@/app/components/base/button'
import Aicon from '@/app/components/base/a-icon'

type AddProps = {
  nodeId: string
  nodeData: CommonNodeType
  sourceHandle: string
  isParallel?: boolean
}
const Add = ({ nodeId, nodeData, sourceHandle, isParallel }: AddProps) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { handleNodeAdd } = useNodesInteractions()
  const { nodesReadOnly } = useNodesReadOnly()
  const { availableNextBlocks } = useAvailableBlocks(
    nodeData.type,
    nodeData.isInIteration,
  )
  const { checkParallelLimit } = useWorkflow()

  const handleSelect = useCallback<OnSelectBlock>(
    (type, toolDefaultValue) => {
      handleNodeAdd(
        {
          nodeType: type,
          toolDefaultValue,
        },
        {
          prevNodeId: nodeId,
          prevNodeSourceHandle: sourceHandle,
        },
      )
    },
    [nodeId, sourceHandle, handleNodeAdd],
  )

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen && !checkParallelLimit(nodeId, sourceHandle))
        return

      setOpen(newOpen)
    },
    [checkParallelLimit, nodeId, sourceHandle],
  )

  const renderTrigger = useCallback(
    (open: boolean) => {
      return (
        <Button
          variant={open ? 'ghost-accent' : 'ghost'}
          size="medium"
          className="btn-icon-left btn-rounded w-full"
          disabled={nodesReadOnly}
        >
          <Aicon icon="icon-add" size={20} className="a-icon--btn"></Aicon>
          <div className="w-full text-left">
            {isParallel
              ? t('workflow.common.addParallelNode')
              : t('workflow.panel.selectNextStep')}
          </div>
        </Button>
      )
    },
    [t, nodesReadOnly, isParallel],
  )

  return (
    <BlockSelector
      open={open}
      onOpenChange={handleOpenChange}
      disabled={nodesReadOnly}
      onSelect={handleSelect}
      placement="top"
      offset={0}
      trigger={renderTrigger}
      popupClassName="!w-[328px]"
      availableBlocksTypes={availableNextBlocks}
    />
  )
}

export default memo(Add)
