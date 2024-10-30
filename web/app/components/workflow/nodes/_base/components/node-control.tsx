import type { FC } from 'react'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useNodeDataUpdate,
  useNodesInteractions,
  useNodesSyncDraft,
} from '../../../hooks'
import type { Node } from '../../../types'
import { canRunBySingle } from '../../../utils'
import PanelOperator from './panel-operator'
import Tooltip from '@/app/components/base/tooltip'
import Button from '@/app/components/base/button'
import Aicon from '@/app/components/base/a-icon'

type NodeControlProps = Pick<Node, 'id' | 'data'>
const NodeControl: FC<NodeControlProps> = ({ id, data }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const { handleNodeDataUpdate } = useNodeDataUpdate()
  const { handleNodeSelect } = useNodesInteractions()
  const { handleSyncWorkflowDraft } = useNodesSyncDraft()

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen)
  }, [])

  return (
    <div
      className={`hidden group-hover:flex pb-1 absolute -right-2 -top-11 
      ${data.selected && '!flex'}
      ${open && '!flex'}
      `}
    >
      <div
        className="flex fade scale-75 items-center p-1 bg-white rounded-full border-1 border-gray-100 shadow-lg text-gray-500"
        onClick={e => e.stopPropagation()}
      >
        {canRunBySingle(data.type) && (
          <Button
            variant={data._isSingleRun ? 'ghost-accent' : 'ghost'}
            size="medium"
            className="btn-icon"
            onClick={() => {
              handleNodeDataUpdate({
                id,
                data: {
                  _isSingleRun: !data._isSingleRun,
                },
              })
              handleNodeSelect(id)
              if (!data._isSingleRun)
                handleSyncWorkflowDraft(true)
            }}
          >
            {!data._isSingleRun ? (
              <Tooltip
                popupContent={t('workflow.panel.runThisStep')}
                asChild={false}
              >
                <Aicon size={20} icon="icon-play" className="a-icon--btn" />
              </Tooltip>
            ) : (
              <Aicon size={20} icon="icon-play" className="a-icon--btn" />
            )}
          </Button>
        )}
        <PanelOperator
          id={id}
          data={data}
          offset={0}
          onOpenChange={handleOpenChange}
          triggerClassName=""
        />
      </div>
    </div>
  )
}

export default memo(NodeControl)
