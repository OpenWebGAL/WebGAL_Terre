package com.openwebgal.terre.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.openwebgal.terre.store.LogStore
import com.openwebgal.terre.store.TerreStore

class StoreUpdateReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_UPDATE_STORE = "com.openwebgal.terre.ACTION_UPDATE_STORE"
        const val EXTRA_METHOD = "extra_method"
        const val EXTRA_IS_RUNNING = "extra_is_running"
        const val EXTRA_LOG_MESSAGE = "extra_log_message"
        const val EXTRA_LOGS = "extra_logs"

        const val METHOD_UPDATE_IS_RUNNING = "update_is_running"
        const val METHOD_ADD_LOG = "add_log"
        const val METHOD_SET_LOGS = "set_logs"
        const val METHOD_RESET_LOGS = "reset_logs"
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION_UPDATE_STORE) {
            return
        }

        when (intent.getStringExtra(EXTRA_METHOD)) {

            METHOD_UPDATE_IS_RUNNING -> {
                val isRunning = intent.getBooleanExtra(EXTRA_IS_RUNNING, false)
                TerreStore.updateIsRunning(isRunning)
            }

            METHOD_ADD_LOG -> {
                val message = intent.getStringExtra(EXTRA_LOG_MESSAGE)
                if (message != null) {
                    LogStore.addLog(message)
                }
            }

            METHOD_SET_LOGS -> {
                val logs = intent.getStringArrayListExtra(EXTRA_LOGS)
                if (logs != null) {
                    LogStore.setLogs(logs)
                }
            }

            METHOD_RESET_LOGS -> {
                LogStore.resetLogs()
            }
        }
    }
}