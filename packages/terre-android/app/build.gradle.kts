import groovy.json.JsonSlurper
import java.io.FileInputStream
import java.io.FileNotFoundException
import java.util.Properties
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")

if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}

fun getVersionFromPackageJson(): String {
    val packageJsonFile = rootProject.file("../../package.json")
    if (!packageJsonFile.exists()) {
        throw FileNotFoundException("package.json not found at ${packageJsonFile.absolutePath}")
    }

    val jsonSlurper = JsonSlurper()
    val json = jsonSlurper.parse(packageJsonFile) as Map<*, *>
    val version = json["version"] as? String

    return version ?: throw IllegalArgumentException("Version not found in package.json")
}

android {
    namespace = "com.openwebgal.terre"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.openwebgal.terre"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = getVersionFromPackageJson()

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }
    signingConfigs {
        if (keystorePropertiesFile.exists())
            create("release") {
                keyAlias = keystoreProperties["keyAlias"] as? String
                    ?: throw IllegalArgumentException("Key alias is missing")
                keyPassword = keystoreProperties["keyPassword"] as? String
                    ?: throw IllegalArgumentException("Key password is missing")
                storeFile = (keystoreProperties["storeFile"] as? String)?.let { file(it) }
                    ?: throw IllegalArgumentException("Store file is missing")
                storePassword = keystoreProperties["storePassword"] as? String
                    ?: throw IllegalArgumentException("Store password is missing")
            }
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            if (keystorePropertiesFile.exists())
                signingConfig = signingConfigs.getByName("release")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
    }
    packaging {
        jniLibs {
            useLegacyPackaging = true
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.browser)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.commons.compress)
    implementation(libs.xz)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}

apply(from = "./download-nodejs.gradle.kts")