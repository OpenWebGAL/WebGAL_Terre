package com.openwebgal.terre

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.AssetManager
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.core.view.WindowCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import com.openwebgal.terre.ui.theme.TerreTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream
import java.io.InputStreamReader
import java.io.OutputStream
import java.util.concurrent.Executors

class MainActivity : ComponentActivity() {

    companion object {
        init {
            System.loadLibrary("terre")
            System.loadLibrary("node")
        }
    }

    private external fun startNodeWithArguments(arguments: Array<String>): Int
    private external fun stopNode(): Int

    private val nodeDirName = "terre"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            TerreTheme {
                MainScreen(
                    launchUrl = ::launchUrl,
                    start = ::start,
                    stop = ::stop,
                )
            }
        }
    }

    fun start() {
        try {
            val executor = Executors.newSingleThreadExecutor()
            executor.submit {
                val nodeDir =
                    applicationContext.getExternalFilesDir(null)?.absolutePath + "/" + nodeDirName
                copyAssets(nodeDir)
                startNodeWithArguments(
                    arrayOf(
                        "node",
                        "$nodeDir/main.js",
                        "--cwd",
                        nodeDir
                    )
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun stop() {
        try {
            stopNode()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun copyAssets(nodeDir: String) {
        if (wasAPKUpdated()) {
            Log.i("ASSETS", "Start Copy Assets")
//            val nodeDirReference = File(nodeDir)
//            if (nodeDirReference.exists()) {
//                deleteFolderRecursively(nodeDirReference)
//            }
            copyAssetFolder(applicationContext.assets, nodeDirName, nodeDir)

            saveLastUpdateTime()

            Log.i("ASSETS", "Copy Assets Finished")
        }
    }

    private fun deleteFolderRecursively(file: File): Boolean {
        return try {
            var res = true
            val childFiles = file.listFiles() ?: return file.delete()

            for (childFile in childFiles) {
                res = if (childFile.isDirectory) {
                    res and deleteFolderRecursively(childFile)
                } else {
                    res and childFile.delete()
                }
            }
            res and file.delete()
            res
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    private fun copyAssetFolder(
        assetManager: AssetManager,
        fromAssetPath: String,
        toPath: String
    ): Boolean {
        return try {
            val files = assetManager.list(fromAssetPath) ?: return copyAsset(
                assetManager,
                fromAssetPath,
                toPath
            )
            var res = true

            if (files.isEmpty()) {
                res = copyAsset(assetManager, fromAssetPath, toPath)
            } else {
                File(toPath).mkdirs()
                for (file in files) {
                    res = copyAssetFolder(assetManager, "$fromAssetPath/$file", "$toPath/$file")
                }
            }
            res
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    private fun copyAsset(
        assetManager: AssetManager,
        fromAssetPath: String,
        toPath: String
    ): Boolean {
        var `in`: InputStream? = null
        var out: OutputStream? = null
        return try {
            `in` = assetManager.open(fromAssetPath)
            File(toPath).createNewFile()
            out = FileOutputStream(toPath)
            copyFile(`in`, out)
            `in`.close()
            out.flush()
            out.close()
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        } finally {
            try {
                `in`?.close()
                out?.close()
            } catch (e: IOException) {
                e.printStackTrace()
            }
        }
    }

    private fun copyFile(inputStream: InputStream, outputStream: OutputStream) {
        val buffer = ByteArray(1024)
        var read: Int
        while (inputStream.read(buffer).also { read = it } != -1) {
            outputStream.write(buffer, 0, read)
        }
    }

    private fun launchUrl(url: String) {
        val intent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse(url)
        }
        try {
            startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "Could not open browser", Toast.LENGTH_SHORT).show()
        }
    }

    private fun wasAPKUpdated(): Boolean {
        val prefs =
            applicationContext.getSharedPreferences("NODEJS_MOBILE_PREFS", Context.MODE_PRIVATE)
        val previousLastUpdateTime = prefs.getLong("NODEJS_MOBILE_APK_LastUpdateTime", 0)
        var lastUpdateTime: Long = 1
        try {
            val packageInfo =
                applicationContext.packageManager.getPackageInfo(applicationContext.packageName, 0)
            lastUpdateTime = packageInfo.lastUpdateTime
        } catch (e: PackageManager.NameNotFoundException) {
            e.printStackTrace()
        }
        return lastUpdateTime != previousLastUpdateTime
    }

    private fun saveLastUpdateTime() {
        var lastUpdateTime: Long = 1
        try {
            val packageInfo =
                applicationContext.packageManager.getPackageInfo(applicationContext.packageName, 0)
            lastUpdateTime = packageInfo.lastUpdateTime
        } catch (e: PackageManager.NameNotFoundException) {
            e.printStackTrace()
        }
        val prefs =
            applicationContext.getSharedPreferences("NODEJS_MOBILE_PREFS", Context.MODE_PRIVATE)
        val editor = prefs.edit()
        editor.putLong("NODEJS_MOBILE_APK_LastUpdateTime", lastUpdateTime)
        editor.apply()
    }
}

@Composable
fun MainScreen(
    terreViewModel: TerreViewModel = viewModel(),
    launchUrl: (String) -> Unit,
    start: () -> Unit,
    stop: () -> Unit,
) {

    val isCopyingAssets by terreViewModel.isCopyingAssets.collectAsState()

    LaunchedEffect(Unit) {
        terreViewModel.startNode(start)
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                terreViewModel = terreViewModel,
                launchUrl = launchUrl,
                start = start,
                stop = stop
            )
        },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            verticalArrangement = Arrangement.Top,
            horizontalAlignment = Alignment.Start,
        ) {
            if (isCopyingAssets)
                Box(modifier = Modifier.fillMaxSize()) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator()
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "正在复制资产，请稍候...",
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            LogcatView(terreViewModel)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TopAppBar(
    terreViewModel: TerreViewModel,
    launchUrl: (String) -> Unit,
    start: () -> Unit,
    stop: () -> Unit,
) {
    val isNodeRunning by terreViewModel.isNodeRunning.collectAsState()
    TopAppBar(
        title = { Text("WebGAL Terre") },
        actions = {
//            if (!isNodeRunning) {
//                TextButton(onClick = {
//                    terreViewModel.startNode(start)
//                }) {
//                    Text("启动")
//                }
//            }
            if (isNodeRunning) {
                TextButton(onClick = {
                    launchUrl("http://localhost:3001/")
                }) {
                    Text("打开浏览器")
                }
            }
            TextButton(onClick = {
                terreViewModel.stopNode(stop)
            }) {
                Text("关闭")
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.inversePrimary
        )

    )
}

private const val ADBTAG = "NODEJS-MOBILE"

@Composable
fun LogcatView(terreViewModel: TerreViewModel) {
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
                                    logLine.split("$ADBTAG:").last().replace("\u001B", "").trim()
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