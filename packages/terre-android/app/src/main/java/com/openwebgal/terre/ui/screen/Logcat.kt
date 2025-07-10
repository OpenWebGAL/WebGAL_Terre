package com.openwebgal.terre.ui.screen

import android.util.Log
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.openwebgal.terre.viewmodel.TerreViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.IOException
import java.io.InputStreamReader

private const val ADBTAG = "NODEJS-MOBILE"

@Composable
fun Logcat(terreViewModel: TerreViewModel) {
    val coroutineScope = rememberCoroutineScope()
    val scrollState = rememberScrollState()
    val logLines by terreViewModel.logLines.collectAsState()

    LaunchedEffect(key1 = Unit) {
        coroutineScope.launch(Dispatchers.IO) {
            try {
                clearLogcat()

                val process = ProcessBuilder("logcat").redirectErrorStream(true).start()
                val bufferedReader = BufferedReader(InputStreamReader(process.inputStream))

                var line: String?
                while (bufferedReader.readLine().also { line = it } != null && isActive) {
                    line?.let { logLine ->
                        if (logLine.contains(ADBTAG) || logLine.contains("ASSETS") || logLine.contains(
                                "E/"
                            )
                        ) {
                            withContext(Dispatchers.Main) {
                                terreViewModel.addLogLine(
                                    cleanLog(logLine)
                                )
                            }
                        }
                    }
                }
                process.destroy()
                Log.d("LogcatView", "Logcat reading stopped.")
                bufferedReader.close()
            } catch (e: IOException) {
                Log.e(
                    "LogcatView",
                    "Error reading logcat in coroutine: ${e.message}"
                )
            }
        }
    }

    LaunchedEffect(logLines.size) {
        if (logLines.isNotEmpty()) {
            scrollState.animateScrollTo(scrollState.maxValue)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(scrollState)
    ) {
        logLines.forEach { line ->
            Text(
                line,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
            )
        }
    }
}

fun clearLogcat() {
    try {
        val process = Runtime.getRuntime().exec("logcat -c")
        process.waitFor()
    } catch (e: IOException) {
        Log.e("LogcatView", "Error clearing logcat: ${e.message}")
    } catch (e: InterruptedException) {
        Log.e("LogcatView", "Error clearing logcat: ${e.message}")
        Thread.currentThread().interrupt()
    }
}

fun cleanLog(logLine: String): String {
    val lastPart = logLine.split("$ADBTAG:").last()
    val cleanedLog = lastPart.replace(Regex("\u001B\\[[;\\d]*m"), "").trim()
    return cleanedLog
}