package com.openwebgal.terre.ui.screen

import android.content.Intent
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.core.net.toUri
import com.openwebgal.terre.R
import com.openwebgal.terre.service.TerreService
import com.openwebgal.terre.store.TerreStore

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppBar() {
    val context = LocalContext.current
    val isRunning by TerreStore.isRunning.collectAsState()

    TopAppBar(
        title = { Text(stringResource(R.string.app_name)) },
        actions = {
            TextButton(
                onClick = {
                    val intent = Intent(Intent.ACTION_VIEW, "http://localhost:3001".toUri())
                    context.startActivity(intent)
                }
            ) {
                Text(stringResource(R.string.open_browser))
            }
            TextButton(onClick = {
                val serviceIntent = Intent(context, TerreService::class.java)
                if (isRunning) {
                    context.stopService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            }) {
                if (isRunning) {
                    Text(stringResource(R.string.stop))
                } else {
                    Text(stringResource(R.string.start))
                }
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.inversePrimary
        )
    )
}