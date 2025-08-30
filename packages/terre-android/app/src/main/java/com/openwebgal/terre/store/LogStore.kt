package com.openwebgal.terre.store

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

object LogStore {
    private const val MAX_LOG_LINES = 500

    private val _logs = MutableStateFlow<List<String>>(emptyList())

    val logs: StateFlow<List<String>> = _logs.asStateFlow()

    fun addLog(message: String) {
        _logs.value = (_logs.value + message).takeLast(MAX_LOG_LINES)
    }

    fun setLogs(logs: List<String>) {
        _logs.value = logs.takeLast(MAX_LOG_LINES)
    }

    fun resetLogs() {
        _logs.value = emptyList()
    }
}