import {
  memo,
  useCallback,
  useEffect,
  // useRef,
  useState,
} from 'react'
import { RiClipboardLine } from '@remixicon/react'
import { useTranslation } from 'react-i18next'
import copy from 'copy-to-clipboard'
import { useBoolean } from 'ahooks'
import ResultText from '../run/result-text'
import ResultPanel from '../run/result-panel'
import TracingPanel from '../run/tracing-panel'
import { useWorkflowInteractions } from '../hooks'
import { useStore } from '../store'
import { WorkflowRunningStatus } from '../types'
import { SimpleBtn } from '../../app/text-generate/item'
import Toast from '../../base/toast'
import IterationResultPanel from '../run/iteration-result-panel'
import NavbarTab from '../../base/tab'
import Button from '../../base/button'
import Aicon from '../../base/a-icon'
import InputsPanel from './inputs-panel'
import cn from '@/utils/classnames'
import Loading from '@/app/components/base/loading'
import type { NodeTracing } from '@/types/workflow'

const WorkflowPreview = () => {
  const { t } = useTranslation()
  const { handleCancelDebugAndPreviewPanel } = useWorkflowInteractions()
  const workflowRunningData = useStore(s => s.workflowRunningData)
  const showInputsPanel = useStore(s => s.showInputsPanel)
  const showDebugAndPreviewPanel = useStore(s => s.showDebugAndPreviewPanel)
  const [currentTab, setCurrentTab] = useState<string>(
    showInputsPanel ? 'INPUT' : 'TRACING',
  )

  const switchTab = async (tab: string) => {
    setCurrentTab(tab)
  }

  useEffect(() => {
    if (showDebugAndPreviewPanel && showInputsPanel)
      setCurrentTab('INPUT')
  }, [showDebugAndPreviewPanel, showInputsPanel])

  useEffect(() => {
    if (
      (workflowRunningData?.result.status === WorkflowRunningStatus.Succeeded
        || workflowRunningData?.result.status === WorkflowRunningStatus.Failed)
      && !workflowRunningData.resultText
    )
      switchTab('DETAIL')
  }, [workflowRunningData])

  const [iterationRunResult, setIterationRunResult] = useState<NodeTracing[][]>(
    [],
  )
  const [
    isShowIterationDetail,
    { setTrue: doShowIterationDetail, setFalse: doHideIterationDetail },
  ] = useBoolean(false)

  const handleShowIterationDetail = useCallback(
    (detail: NodeTracing[][]) => {
      setIterationRunResult(detail)
      doShowIterationDetail()
    },
    [doShowIterationDetail],
  )

  if (isShowIterationDetail) {
    return (
      <div
        className={`
      flex flex-col w-[420px] h-full rounded-l-2xl shadow-xl bg-white
    `}
      >
        <IterationResultPanel
          list={iterationRunResult}
          onHide={doHideIterationDetail}
          onBack={doHideIterationDetail}
        />
      </div>
    )
  }

  return (
    <div
      className={`
      fade flex flex-col w-[420px] h-full rounded-2xl shadow-xl bg-white
    `}
    >
      <div className="flex items-center justify-between p-4 pb-1 text-base font-semibold text-gray-900">
        {`Test Run${
          !workflowRunningData?.result.sequence_number
            ? ''
            : `#${workflowRunningData?.result.sequence_number}`
        }`}
        <Button
          variant="ghost"
          size="medium"
          onClick={() => handleCancelDebugAndPreviewPanel()}
          className="btn-icon btn-icon-rotate absolute right-2 top-2"
        >
          <Aicon size={20} icon="icon-cancel" className="a-icon--btn" />
        </Button>
      </div>
      <div className="grow relative flex flex-col">
        {isShowIterationDetail ? (
          <IterationResultPanel
            list={iterationRunResult}
            onHide={doHideIterationDetail}
            onBack={doHideIterationDetail}
          />
        ) : (
          <>
            <div className="shrink-0 flex gap-2 mt-4 items-center px-4 border-b border-gray-100">
              {showInputsPanel && (
                <NavbarTab
                  active={currentTab === 'INPUT'}
                  onClick={() => switchTab('INPUT')}
                  size={'small'}
                >
                  {t('runLog.input')}
                </NavbarTab>
              )}
              <NavbarTab
                active={currentTab === 'RESULT'}
                onClick={() => {
                  if (!workflowRunningData)
                    return
                  switchTab('RESULT')
                }}
                disabled={!workflowRunningData}
                size={'small'}
              >
                {t('runLog.result')}
              </NavbarTab>
              <NavbarTab
                active={currentTab === 'DETAIL'}
                onClick={() => {
                  if (!workflowRunningData)
                    return
                  switchTab('DETAIL')
                }}
                disabled={!workflowRunningData}
                size={'small'}
              >
                {t('runLog.detail')}
              </NavbarTab>
              <NavbarTab
                active={currentTab === 'TRACING'}
                onClick={() => {
                  if (!workflowRunningData)
                    return
                  switchTab('TRACING')
                }}
                disabled={!workflowRunningData}
                size={'small'}
              >
                {t('runLog.tracing')}
              </NavbarTab>
            </div>
            <div
              className={cn('grow bg-white h-0 overflow-y-auto rounded-b-2xl')}
            >
              {currentTab === 'INPUT' && showInputsPanel && (
                <InputsPanel onRun={() => switchTab('RESULT')} />
              )}
              {currentTab === 'RESULT' && (
                <>
                  <ResultText
                    isRunning={
                      workflowRunningData?.result?.status
                        === WorkflowRunningStatus.Running
                      || !workflowRunningData?.result
                    }
                    outputs={workflowRunningData?.resultText}
                    error={workflowRunningData?.result?.error}
                    onClick={() => switchTab('DETAIL')}
                  />
                  {workflowRunningData?.result.status
                    === WorkflowRunningStatus.Succeeded
                    && workflowRunningData?.resultText
                    && typeof workflowRunningData?.resultText === 'string' && (
                    <SimpleBtn
                      className={cn('ml-4 mb-4 inline-flex space-x-1')}
                      onClick={() => {
                        const content = workflowRunningData?.resultText
                        if (typeof content === 'string')
                          copy(content)
                        else copy(JSON.stringify(content))
                        Toast.notify({
                          type: 'success',
                          message: t('common.actionMsg.copySuccessfully'),
                        })
                      }}
                    >
                      <RiClipboardLine className="w-3.5 h-3.5" />
                      <div>{t('common.operation.copy')}</div>
                    </SimpleBtn>
                  )}
                </>
              )}
              {currentTab === 'DETAIL' && (
                <ResultPanel
                  inputs={workflowRunningData?.result?.inputs}
                  outputs={workflowRunningData?.result?.outputs}
                  status={workflowRunningData?.result?.status || ''}
                  error={workflowRunningData?.result?.error}
                  elapsed_time={workflowRunningData?.result?.elapsed_time}
                  total_tokens={workflowRunningData?.result?.total_tokens}
                  created_at={workflowRunningData?.result?.created_at}
                  created_by={
                    (workflowRunningData?.result?.created_by as any)?.name
                  }
                  steps={workflowRunningData?.result?.total_steps}
                />
              )}
              {currentTab === 'DETAIL' && !workflowRunningData?.result && (
                <div className="flex h-full items-center justify-center bg-white">
                  <Loading />
                </div>
              )}
              {currentTab === 'TRACING' && (
                <TracingPanel
                  list={workflowRunningData?.tracing || []}
                  onShowIterationDetail={handleShowIterationDetail}
                />
              )}
              {currentTab === 'TRACING'
                && !workflowRunningData?.tracing?.length && (
                <div className="flex h-full items-center justify-center bg-gray-50">
                  <Loading />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default memo(WorkflowPreview)
