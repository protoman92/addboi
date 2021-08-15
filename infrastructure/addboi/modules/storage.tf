data "aws_s3_bucket" "asset" {
  bucket = "${local.service}-global-asset-origin"
}
