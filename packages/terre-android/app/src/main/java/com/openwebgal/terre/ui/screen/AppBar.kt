package com.openwebgal.terre.ui.screen

import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.res.stringResource
import com.openwebgal.terre.R
import com.openwebgal.terre.viewmodel.TerreViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppBar(
    terreViewModel: TerreViewModel,
    launchUrl: (String) -> Unit,
    stop: () -> Unit,
) {
    val isNodeRunning by terreViewModel.isNodeRunning.collectAsState()
    TopAppBar(
        title = { Text(stringResource(R.string.app_name)) },
        actions = {
            if (isNodeRunning) {
                TextButton(onClick = {
                    launchUrl("http://localhost:3001/")
                }) {
                    Text(stringResource(R.string.open_browser))
                }
            }
            TextButton(onClick = {
                terreViewModel.stopNode(stop)
            }) {
                Text(stringResource(R.string.stop))
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.inversePrimary
        )
    )
}