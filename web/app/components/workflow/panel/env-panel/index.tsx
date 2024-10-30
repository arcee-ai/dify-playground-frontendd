import { memo, useCallback, useState } from 'react'
import { useStoreApi } from 'reactflow'
import { useTranslation } from 'react-i18next'
import { useStore } from '@/app/components/workflow/store'
import VariableTrigger from '@/app/components/workflow/panel/env-panel/variable-trigger'
import EnvItem from '@/app/components/workflow/panel/env-panel/env-item'
import type { EnvironmentVariable } from '@/app/components/workflow/types'
import {
  findUsedVarNodes,
  updateNodeVars,
} from '@/app/components/workflow/nodes/_base/components/variable/utils'
import RemoveEffectVarConfirm from '@/app/components/workflow/nodes/_base/components/remove-effect-var-confirm'
import cn from '@/utils/classnames'
import { useNodesSyncDraft } from '@/app/components/workflow/hooks/use-nodes-sync-draft'
import Button from '@/app/components/base/button'
import Aicon from '@/app/components/base/a-icon'

const EnvPanel = () => {
  const { t } = useTranslation()
  const store = useStoreApi()
  const setShowEnvPanel = useStore(s => s.setShowEnvPanel)
  const envList = useStore(
    s => s.environmentVariables,
  ) as EnvironmentVariable[]
  const envSecrets = useStore(s => s.envSecrets)
  const updateEnvList = useStore(s => s.setEnvironmentVariables)
  const setEnvSecrets = useStore(s => s.setEnvSecrets)
  const { doSyncWorkflowDraft } = useNodesSyncDraft()

  const [showVariableModal, setShowVariableModal] = useState(false)
  const [currentVar, setCurrentVar] = useState<EnvironmentVariable>()

  const [showRemoveVarConfirm, setShowRemoveConfirm] = useState(false)
  const [cacheForDelete, setCacheForDelete] = useState<EnvironmentVariable>()

  const formatSecret = (s: string) => {
    return s.length > 8
      ? `${s.slice(0, 6)}************${s.slice(-2)}`
      : '********************'
  }

  const getEffectedNodes = useCallback(
    (env: EnvironmentVariable) => {
      const { getNodes } = store.getState()
      const allNodes = getNodes()
      return findUsedVarNodes(['env', env.name], allNodes)
    },
    [store],
  )

  const removeUsedVarInNodes = useCallback(
    (env: EnvironmentVariable) => {
      const { getNodes, setNodes } = store.getState()
      const effectedNodes = getEffectedNodes(env)
      const newNodes = getNodes().map((node) => {
        if (effectedNodes.find(n => n.id === node.id))
          return updateNodeVars(node, ['env', env.name], [])

        return node
      })
      setNodes(newNodes)
    },
    [getEffectedNodes, store],
  )

  const handleEdit = (env: EnvironmentVariable) => {
    setCurrentVar(env)
    setShowVariableModal(true)
  }

  const handleDelete = useCallback(
    (env: EnvironmentVariable) => {
      removeUsedVarInNodes(env)
      updateEnvList(envList.filter(e => e.id !== env.id))
      setCacheForDelete(undefined)
      setShowRemoveConfirm(false)
      doSyncWorkflowDraft()
      if (env.value_type === 'secret') {
        const newMap = { ...envSecrets }
        delete newMap[env.id]
        setEnvSecrets(newMap)
      }
    },
    [
      doSyncWorkflowDraft,
      envList,
      envSecrets,
      removeUsedVarInNodes,
      setEnvSecrets,
      updateEnvList,
    ],
  )

  const deleteCheck = useCallback(
    (env: EnvironmentVariable) => {
      const effectedNodes = getEffectedNodes(env)
      if (effectedNodes.length > 0) {
        setCacheForDelete(env)
        setShowRemoveConfirm(true)
      }
      else {
        handleDelete(env)
      }
    },
    [getEffectedNodes, handleDelete],
  )

  const handleSave = useCallback(
    async (env: EnvironmentVariable) => {
      // add env
      let newEnv = env
      if (!currentVar) {
        if (env.value_type === 'secret') {
          setEnvSecrets({
            ...envSecrets,
            [env.id]: formatSecret(env.value),
          })
        }
        const newList = [env, ...envList]
        updateEnvList(newList)
        await doSyncWorkflowDraft()
        updateEnvList(
          newList.map(e =>
            e.id === env.id && env.value_type === 'secret'
              ? { ...e, value: '[__HIDDEN__]' }
              : e,
          ),
        )
        return
      }
      else if (currentVar.value_type === 'secret') {
        if (env.value_type === 'secret') {
          if (envSecrets[currentVar.id] !== env.value) {
            newEnv = env
            setEnvSecrets({
              ...envSecrets,
              [env.id]: formatSecret(env.value),
            })
          }
          else {
            newEnv = { ...env, value: '[__HIDDEN__]' }
          }
        }
      }
      else {
        if (env.value_type === 'secret') {
          newEnv = env
          setEnvSecrets({
            ...envSecrets,
            [env.id]: formatSecret(env.value),
          })
        }
      }
      const newList = envList.map(e => (e.id === currentVar.id ? newEnv : e))
      updateEnvList(newList)
      // side effects of rename env
      if (currentVar.name !== env.name) {
        const { getNodes, setNodes } = store.getState()
        const effectedNodes = getEffectedNodes(currentVar)
        const newNodes = getNodes().map((node) => {
          if (effectedNodes.find(n => n.id === node.id)) {
            return updateNodeVars(
              node,
              ['env', currentVar.name],
              ['env', env.name],
            )
          }

          return node
        })
        setNodes(newNodes)
      }
      await doSyncWorkflowDraft()
      updateEnvList(
        newList.map(e =>
          e.id === env.id && env.value_type === 'secret'
            ? { ...e, value: '[__HIDDEN__]' }
            : e,
        ),
      )
    },
    [
      currentVar,
      doSyncWorkflowDraft,
      envList,
      envSecrets,
      getEffectedNodes,
      setEnvSecrets,
      store,
      updateEnvList,
    ],
  )

  return (
    <div
      className={cn('fade relative flex flex-col w-[420px] p-4 h-full card-m')}
    >
      <div className="shrink-0 flex items-center justify-between pb-0 text-text-primary system-xl-semibold">
        {t('workflow.env.envPanelTitle')}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="medium"
            onClick={() => setShowEnvPanel(false)}
            className="btn-icon btn-icon-rotate absolute top-1 right-1"
          >
            <Aicon icon="icon-cancel" className="a-icon--btn" size={20} />
          </Button>
        </div>
      </div>
      <div className="shrink-0 py-4 system-sm-regular text-text-tertiary">
        {t('workflow.env.envDescription')}
      </div>
      <div className="shrink-0 pt-2 pb-4">
        <VariableTrigger
          open={showVariableModal}
          setOpen={setShowVariableModal}
          env={currentVar}
          onSave={handleSave}
          onClose={() => setCurrentVar(undefined)}
        />
      </div>
      <div className="grow overflow-y-auto">
        {envList.map(env => (
          <EnvItem
            key={env.id}
            env={env}
            onEdit={handleEdit}
            onDelete={deleteCheck}
          />
        ))}
      </div>
      <RemoveEffectVarConfirm
        isShow={showRemoveVarConfirm}
        onCancel={() => setShowRemoveConfirm(false)}
        onConfirm={() => cacheForDelete && handleDelete(cacheForDelete)}
      />
    </div>
  )
}

export default memo(EnvPanel)
