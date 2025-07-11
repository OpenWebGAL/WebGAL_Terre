package com.openwebgal.terre.viewmodel

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class TerreViewModel : ViewModel() {
    private val MAX_LOG_LINES = 500

    private val _logLines = MutableStateFlow<List<String>>(emptyList())
    val logLines: StateFlow<List<String>> = _logLines.asStateFlow()

    fun addLogLine(message: String) {
        _logLines.value = (_logLines.value + message).takeLast(MAX_LOG_LINES)
    }

    fun clearLogLines() {
        _logLines.value = emptyList()
    }
}