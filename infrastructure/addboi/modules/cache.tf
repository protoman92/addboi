module "ddb_user_context_cache" {
  source             = "terraform-aws-modules/dynamodb-table/aws"
  billing_mode       = "PROVISIONED"
  hash_key           = "targetID"
  name               = "user-context-${local.service}-${var.stage}"
  read_capacity      = var.user_cache_provisioned_capacity
  range_key          = "targetPlatform"
  ttl_attribute_name = "TTL"
  ttl_enabled        = true
  write_capacity     = var.user_cache_provisioned_capacity

  attributes = [
    {
      name = "targetID"
      type = "S"
    },
    {
      name = "targetPlatform"
      type = "S"
    }
  ]

  tags = {
    service = local.service
    stage   = var.stage
  }
}
