package com.openwebgal.terre.store

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

object LogStore {
    private const val MAX_LOG_LINES = 500

    private val _logLines = MutableStateFlow<List<String>>(emptyList())

    val logLines: StateFlow<List<String>> = _logLines.asStateFlow()

    fun addLogLine(message: String) {
        _logLines.value = (_logLines.value + message).takeLast(MAX_LOG_LINES)
    }

    fun clearLogLines() {
        _logLines.value = emptyList()
    }
}