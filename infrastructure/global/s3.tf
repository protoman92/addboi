module "tf_state_global" {
  source      = "../terraform-helper/modules/s3/remote_state"
  bucket_name = "addboi-global-state"
  cluster     = local.stage
  region      = local.region
  service     = local.service
  providers = {
    aws = aws.ap-southeast-1
  }
}
