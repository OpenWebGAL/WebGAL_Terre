package com.openwebgal.terre.store

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

object TerreStore {

    private val _isRunning = MutableStateFlow<Boolean>(false)
    val isRunning: StateFlow<Boolean> = _isRunning.asStateFlow()

    private val _isExtracting = MutableStateFlow(false)
    val isExtracting: StateFlow<Boolean> = _isExtracting.asStateFlow()

    fun updateIsRunning(value: Boolean) {
        _isRunning.value = value
    }

    fun updateIsExtracting(value: Boolean) {
        _isExtracting.value = value
    }
}
