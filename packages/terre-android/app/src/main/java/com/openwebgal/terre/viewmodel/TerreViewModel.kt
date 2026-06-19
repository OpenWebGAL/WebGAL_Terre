package com.openwebgal.terre.viewmodel

import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.openwebgal.terre.service.TerreService
import com.openwebgal.terre.store.LogStore
import com.openwebgal.terre.store.TerreStore
import com.openwebgal.terre.utils.Assets
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class TerreViewModel : ViewModel() {

    fun startExtraction(context: Context) {
        if (TerreStore.isExtracting.value) return

        viewModelScope.launch {
            TerreStore.updateIsExtracting(true)
            try {
                val nodeDir = context.getExternalFilesDir(null)?.absolutePath
                if (nodeDir != null) {
                    withContext(Dispatchers.IO) {
                        Assets.ensureNodeRuntime(context)
                        Assets.extractAssets(context, nodeDir)
                    }
                }
            } catch (e: Exception) {
                LogStore.addLog("TERRE", "Extraction failed: ${e.stackTraceToString()}")
                TerreStore.updateIsExtracting(false)
                return@launch
            }
            TerreStore.updateIsExtracting(false)

            val intent = Intent(context, TerreService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }
    }
}
