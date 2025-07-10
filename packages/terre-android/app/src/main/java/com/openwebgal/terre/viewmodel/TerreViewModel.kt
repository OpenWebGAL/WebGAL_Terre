package com.openwebgal.terre.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class TerreViewModel : ViewModel() {
    private val MAX_LOG_LINES = 500

    private val _isNodeRunning = MutableStateFlow(false)
    val isNodeRunning: StateFlow<Boolean> = _isNodeRunning.asStateFlow()

    private val _logLines = MutableStateFlow<List<String>>(emptyList())
    val logLines: StateFlow<List<String>> = _logLines.asStateFlow()

    fun startNode(start: () -> Unit) {
        Log.i("NODE", _isNodeRunning.value.toString())
        if (!_isNodeRunning.value) {
            start()
            _isNodeRunning.value = true
        }
    }

    fun stopNode(stop: () -> Unit) {
        if (_isNodeRunning.value) {
            stop()
            _isNodeRunning.value = false
        }
    }

    fun addLogLine(line: String) {
        _logLines.value += line
        if (_logLines.value.size > MAX_LOG_LINES) {
            _logLines.value = _logLines.value.drop(1)
        }
    }

    fun clearLogLines() {
        _logLines.value = emptyList()
    }
}