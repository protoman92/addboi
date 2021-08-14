data "aws_s3_bucket" "public_asset" {
  bucket = "${local.service}-global-asset"
}
