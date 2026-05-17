from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db, verify_admin_key
from app.models import Billing
from app.schemas import BillingCreate, BillingResponse

router = APIRouter()

@router.get("/billing", response_model=List[BillingResponse])
def get_billing(db: Session = Depends(get_db)):
    """Get all billing records"""
    billing = db.query(Billing).all()
    return billing

@router.post("/billing", response_model=BillingResponse)
def create_billing(bill: BillingCreate, db: Session = Depends(get_db), _: bool = Depends(verify_admin_key)):
    """Create a new billing record - Requires x-api-key header"""
    new_billing = Billing(patient=bill.patient, amount=bill.amount)
    db.add(new_billing)
    db.commit()
    db.refresh(new_billing)
    return new_billing

@router.delete("/billing/{billing_id}")
def delete_billing(billing_id: int, db: Session = Depends(get_db), _: bool = Depends(verify_admin_key)):
    """Delete a billing record by ID - Requires x-api-key header"""
    billing = db.query(Billing).filter(Billing.id == billing_id).first()
    if not billing:
        raise HTTPException(status_code=404, detail="Billing record not found")
    db.delete(billing)
    db.commit()
    return {"message": "Billing record deleted successfully"}
