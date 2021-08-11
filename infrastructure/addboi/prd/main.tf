module "this" {
  source                          = "../modules"
  stage                           = "production"
  user_cache_provisioned_capacity = 5
}

terraform {
  backend "s3" {
    bucket = "addboi-global-state"
    key    = "terraform-addboi-prd.tfstate"
    region = "ap-southeast-1"
  }
}
