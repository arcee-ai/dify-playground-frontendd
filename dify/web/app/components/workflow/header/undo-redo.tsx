import type { FC } from 'react'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TipPopup from '../operator/tip-popup'
import { useWorkflowHistoryStore } from '../workflow-history-store'
import Button from '../../base/button'
import Aicon from '../../base/a-icon'
import { useNodesReadOnly } from '@/app/components/workflow/hooks'
import ViewWorkflowHistory from '@/app/components/workflow/header/view-workflow-history'

export type UndoRedoProps = { handleUndo: () => void; handleRedo: () => void }
const UndoRedo: FC<UndoRedoProps> = ({ handleUndo, handleRedo }) => {
  const { t } = useTranslation()
  const { store } = useWorkflowHistoryStore()
  const [buttonsDisabled, setButtonsDisabled] = useState({
    undo: true,
    redo: true,
  })

  useEffect(() => {
    const unsubscribe = store.temporal.subscribe((state) => {
      setButtonsDisabled({
        undo: state.pastStates.length === 0,
        redo: state.futureStates.length === 0,
      })
    })
    return () => unsubscribe()
  }, [store])

  const { nodesReadOnly } = useNodesReadOnly()

  return (
    <div className="flex items-center p-1 rounded-full bg-white shadow-lg text-gray-500">
      <TipPopup title={t('workflow.common.undo')!} shortcuts={['ctrl', 'z']}>
        <Button
          variant="ghost"
          size="medium"
          className="btn-icon"
          disabled={nodesReadOnly || buttonsDisabled.undo}
          onClick={() =>
            !nodesReadOnly && !buttonsDisabled.undo && handleUndo()
          }
          data-tooltip-id="workflow.undo"
        >
          <Aicon size={20} icon="icon-turn-left" className="a-icon--btn" />
        </Button>
      </TipPopup>
      <TipPopup title={t('workflow.common.redo')!} shortcuts={['ctrl', 'y']}>
        <Button
          variant="ghost"
          size="medium"
          className="btn-icon"
          disabled={nodesReadOnly || buttonsDisabled.redo}
          onClick={() =>
            !nodesReadOnly && !buttonsDisabled.redo && handleRedo()
          }
          data-tooltip-id="workflow.redo"
        >
          <Aicon size={20} icon="icon-turn-right" className="a-icon--btn" />
        </Button>
      </TipPopup>
      <div className="mx-[3px] w-[1px] h-3.5 bg-gray-200"></div>
      <ViewWorkflowHistory />
    </div>
  )
}

export default memo(UndoRedo)
