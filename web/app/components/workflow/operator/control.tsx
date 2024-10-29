import type { MouseEvent } from 'react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  useNodesReadOnly,
  useWorkflowMoveMode,
  useWorkflowOrganize,
} from '../hooks'
import { ControlMode } from '../types'
import { useStore } from '../store'
import Button from '../../base/button'
import Aicon from '../../base/a-icon'
import AddBlock from './add-block'
import TipPopup from './tip-popup'
import { useOperator } from './hooks'

const Control = () => {
  const { t } = useTranslation()
  const controlMode = useStore(s => s.controlMode)
  const { handleModePointer, handleModeHand } = useWorkflowMoveMode()
  const { handleLayout } = useWorkflowOrganize()
  const { handleAddNote } = useOperator()
  const { nodesReadOnly, getNodesReadOnly } = useNodesReadOnly()

  const addNote = (e: MouseEvent<HTMLDivElement>) => {
    if (getNodesReadOnly())
      return

    e.stopPropagation()
    handleAddNote()
  }

  return (
    <div className="flex items-center p-1 rounded-full bg-white shadow-lg text-gray-500">
      <AddBlock />
      <TipPopup title={t('workflow.nodes.note.addNote')}>
        <div onClick={addNote}>
          <Button
            variant="ghost"
            size="medium"
            className="btn-icon"
            disabled={nodesReadOnly}
          >
            <Aicon size={20} icon="icon-add-note" className="a-icon--btn" />
          </Button>
        </div>
      </TipPopup>
      <div className="mx-1 w-[1px] h-3.5 bg-gray-200"></div>
      <TipPopup title={t('workflow.common.pointerMode')} shortcuts={['v']}>
        <Button
          variant={
            controlMode === ControlMode.Pointer ? 'ghost-accent' : 'ghost'
          }
          size="medium"
          className="btn-icon"
          disabled={nodesReadOnly}
          onClick={handleModePointer}
        >
          <Aicon size={20} icon="icon-coursor" className="a-icon--btn" />
        </Button>
      </TipPopup>
      <TipPopup title={t('workflow.common.handMode')} shortcuts={['h']}>
        <Button
          variant={controlMode === ControlMode.Hand ? 'ghost-accent' : 'ghost'}
          size="medium"
          className="btn-icon"
          disabled={nodesReadOnly}
          onClick={handleModeHand}
        >
          <Aicon size={20} icon="icon-hand" className="a-icon--btn" />
        </Button>
      </TipPopup>
      <div className="mx-1 w-[1px] h-3.5 bg-gray-200"></div>
      <TipPopup
        title={t('workflow.panel.organizeBlocks')}
        shortcuts={['ctrl', 'o']}
      >
        <Button
          variant="ghost"
          size="medium"
          className="btn-icon"
          disabled={nodesReadOnly}
          onClick={handleLayout}
        >
          <Aicon size={20} icon="icon-organize" className="a-icon--btn" />
        </Button>
      </TipPopup>
    </div>
  )
}

export default memo(Control)
