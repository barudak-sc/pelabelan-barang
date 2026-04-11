-- CreateTable
CREATE TABLE "app_settings" (
    "id" UUID NOT NULL,
    "app_name" VARCHAR(100) NOT NULL DEFAULT 'InvenTrack',
    "institution_name" VARCHAR(200) NOT NULL DEFAULT 'Instansi',
    "app_description" TEXT,
    "logo_url" VARCHAR(500),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);
