package com.openwebgal.terre.provider

import android.content.Context
import android.database.Cursor
import android.database.MatrixCursor
import android.os.CancellationSignal
import android.os.ParcelFileDescriptor
import android.provider.DocumentsContract.Document
import android.provider.DocumentsContract.Root
import android.provider.DocumentsProvider
import com.openwebgal.terre.R
import java.io.File
import java.io.FileNotFoundException
import java.io.IOException

class TerreProvider : DocumentsProvider() {
    companion object {
        private const val ROOT_ID = "root"

        private val DEFAULT_ROOT_PROJECTION = arrayOf(
            Root.COLUMN_ROOT_ID,
            Root.COLUMN_MIME_TYPES,
            Root.COLUMN_FLAGS,
            Root.COLUMN_ICON,
            Root.COLUMN_TITLE,
            Root.COLUMN_SUMMARY,
            Root.COLUMN_DOCUMENT_ID,
            Root.COLUMN_AVAILABLE_BYTES
        )

        private val DEFAULT_DOCUMENT_PROJECTION = arrayOf(
            Document.COLUMN_DOCUMENT_ID,
            Document.COLUMN_DISPLAY_NAME,
            Document.COLUMN_MIME_TYPE,
            Document.COLUMN_LAST_MODIFIED,
            Document.COLUMN_FLAGS,
            Document.COLUMN_SIZE
        )
    }

    private fun context(): Context = context!!

    private fun baseDirectory(): File = context().getExternalFilesDir(null)!!

    private fun getDocumentId(file: File): String {
        val basePath = baseDirectory().absolutePath
        val fullPath = file.absolutePath
        return (ROOT_ID + "/" + fullPath.substring(basePath.length)).replace("//", "/")
    }

    private fun getFile(documentId: String): File {
        require(documentId.startsWith(ROOT_ID)) { "Invalid document id: $documentId" }
        return File(baseDirectory(), documentId.substring(ROOT_ID.length))
    }

    private fun getMimeType(file: File): String {
        return when {
            file.isDirectory -> Document.MIME_TYPE_DIR
            else -> {
                val extension = file.extension.lowercase()
                when (extension) {
                    "txt" -> "text/plain"
                    "csv" -> "text/csv"
                    "xml" -> "application/xml"
                    "json" -> "application/json"
                    "js", "mjs" -> "application/javascript"
                    "yaml", "yml" -> "application/x-yaml"
                    "html", "htm" -> "text/html"
                    "css" -> "text/css"
                    "scss" -> "text/x-scss"
                    "jpg", "jpeg" -> "image/jpeg"
                    "png" -> "image/png"
                    "gif" -> "image/gif"
                    "bmp" -> "image/bmp"
                    "webp" -> "image/webp"
                    "svg" -> "image/svg+xml"
                    "ico" -> "image/vnd.microsoft.icon"
                    "mp3" -> "audio/mpeg"
                    "wav" -> "audio/wav"
                    "ogg" -> "audio/ogg"
                    "m4a" -> "audio/mp4"
                    "flac" -> "audio/flac"
                    "mp4" -> "video/mp4"
                    "mkv" -> "video/x-matroska"
                    "avi" -> "video/x-msvideo"
                    "mov" -> "video/quicktime"
                    "wmv" -> "video/x-ms-wmv"
                    "webm" -> "video/webm"
                    "flv" -> "video/x-flv"
                    "zip" -> "application/zip"
                    "rar" -> "application/x-rar-compressed"
                    "tar" -> "application/x-tar"
                    "gz" -> "application/gzip"
                    else -> "application/octet-stream"
                }
            }
        }
    }

    private fun includeFile(cursor: MatrixCursor, file: File) {
        val flags = when {
            file.isDirectory -> Document.FLAG_DIR_SUPPORTS_CREATE or Document.FLAG_SUPPORTS_REMOVE or Document.FLAG_SUPPORTS_DELETE or Document.FLAG_SUPPORTS_RENAME
            else -> Document.FLAG_SUPPORTS_WRITE or Document.FLAG_SUPPORTS_REMOVE or Document.FLAG_SUPPORTS_DELETE or Document.FLAG_SUPPORTS_RENAME
        }

        cursor.newRow()
            .add(Document.COLUMN_DOCUMENT_ID, getDocumentId(file))
            .add(Document.COLUMN_MIME_TYPE, getMimeType(file))
            .add(Document.COLUMN_FLAGS, flags)
            .add(Document.COLUMN_LAST_MODIFIED, file.lastModified())
            .add(Document.COLUMN_DISPLAY_NAME, file.name)
            .add(Document.COLUMN_SIZE, file.length())
    }

    override fun onCreate(): Boolean = true

    override fun queryRoots(projection: Array<out String>?): Cursor {
        val cursor = MatrixCursor(projection ?: DEFAULT_ROOT_PROJECTION)
        cursor.newRow()
            .add(Root.COLUMN_ROOT_ID, ROOT_ID)
            .add(Root.COLUMN_SUMMARY, null)
            .add(Root.COLUMN_FLAGS, Root.FLAG_SUPPORTS_IS_CHILD or Root.FLAG_SUPPORTS_CREATE)
            .add(Root.COLUMN_DOCUMENT_ID, "$ROOT_ID/")
            .add(Root.COLUMN_AVAILABLE_BYTES, baseDirectory().freeSpace)
            .add(Root.COLUMN_TITLE, context().getString(R.string.app_name))
            .add(Root.COLUMN_MIME_TYPES, "*/*")
            .add(Root.COLUMN_ICON, R.mipmap.ic_launcher)
        return cursor
    }

    override fun queryChildDocuments(
        parentDocumentId: String,
        projection: Array<out String>?,
        sortOrder: String?
    ): Cursor {
        val cursor = MatrixCursor(projection ?: DEFAULT_DOCUMENT_PROJECTION)
        getFile(parentDocumentId).listFiles()?.forEach { includeFile(cursor, it) }
        return cursor
    }

    override fun queryDocument(documentId: String, projection: Array<out String>?): Cursor {
        val cursor = MatrixCursor(projection ?: DEFAULT_DOCUMENT_PROJECTION)
        includeFile(cursor, getFile(documentId))
        return cursor
    }

    override fun createDocument(
        parentDocumentId: String,
        mimeType: String,
        displayName: String
    ): String {
        val parent = getFile(parentDocumentId)
        val file = File(parent, displayName)

        if (!parent.exists()) throw FileNotFoundException("Parent doesn't exist")

        if (mimeType == Document.MIME_TYPE_DIR) {
            if (!file.mkdirs()) throw FileNotFoundException("Error while creating directory")
        } else {
            if (!file.createNewFile()) throw FileNotFoundException("Error while creating file")
        }

        return getDocumentId(file)
    }

    override fun openDocument(
        documentId: String,
        mode: String,
        signal: CancellationSignal?
    ): ParcelFileDescriptor {
        return ParcelFileDescriptor.open(
            getFile(documentId),
            ParcelFileDescriptor.parseMode(mode)
        )
    }

    override fun deleteDocument(documentId: String) {
        val file = getFile(documentId)
        if (file.exists()) {
            file.deleteRecursively()
        } else {
            throw FileNotFoundException("File not exists")
        }
    }

    override fun removeDocument(documentId: String, parentDocumentId: String) {
        deleteDocument(documentId)
    }

    override fun renameDocument(documentId: String?, displayName: String?): String? {
        if (documentId == null || displayName == null) {
            throw IllegalArgumentException("Document ID and display name must not be null")
        }

        val file = getFile(documentId)
        if (!file.exists()) {
            throw FileNotFoundException("File not found: $documentId")
        }

        val parentDir = file.parentFile
        val newFile = File(parentDir, displayName)

        if (newFile.exists()) {
            throw FileAlreadyExistsException(newFile)
        }

        if (!file.renameTo(newFile)) {
            throw IOException("Failed to rename file: ${file.absolutePath} to ${newFile.absolutePath}")
        }

        return getDocumentId(newFile)
    }

    override fun isChildDocument(parentDocumentId: String, documentId: String): Boolean {
        return documentId.startsWith(parentDocumentId)
    }
}